 "use server"

import { email, string } from "zod";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { ID, Query } from "node-appwrite";
import { Emblema_One } from "next/font/google";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { Session } from "inspector/promises";
import { strict } from "assert";
import { avatarPlaceholderUrl } from "@/src/constants";
import { redirect } from "next/navigation";
import { PassThrough } from "stream";


// ** Create account flow**
//1. User enters full name and email
//2.Check if th user already exist using the mail.
//3.Send OTP to user's email
//1.This will send a secret key for creating a session. 
//4.Create a new user document if the usesr is a new user
//5.Return the user's accountId that will be usesd to complete the login
//6.Verify OTP and authenticate to login

const getUserByEmail = async(email:string) =>{
    const {databases} = await createAdminClient()
    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email",[email])]
    )

    return result.total > 0 ? result.documents[0] : null

} 
const handleError = (error: unknown, message:string) => {
    console.log(error, message)
    throw error
}

 export const sendEmailOTP = async(email:string) => {
    const {account} = await createAdminClient()

    try {
        const session = await account.createEmailToken(ID.unique(),email)
        return session.userId

    } catch (error) {
        handleError(error,"Failed to send email OTP.")
        
    }

}

export const createAccount = async({fullName, email} : {fullName : string; email:string}) => {
    const existingUser = await getUserByEmail(email)

    const accountId = await sendEmailOTP(email)


 if(!accountId) throw new Error ('Failed to send an OTP')
 
    if(!existingUser){
        const {databases} = await createAdminClient()

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: avatarPlaceholderUrl,
                accountId,
            }
        )
    }

    return parseStringify({accountId})
}
export const verifySecret = async ({ accountId, password }: { accountId: string; password: string }) => {
  try {
    const { account } = await createAdminClient()

    // Create session using OTP secret
    const session = await account.createSession(accountId, password) 

    // Store the session in cookies
    ;(await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    })

    return parseStringify({sessionId : session.$id})
  } catch (error) {
    handleError(error, "Failed to verify OTP")
  }
}

export const getCurrentUser = async () => {
    const {databases, account} = await createSessionClient()

    const result = await account.get()

    const user = await databases.listDocuments(
        appwriteConfig.databaseId,

        appwriteConfig.usersCollectionId,
        [Query.equal("accountId",result.$id)]
    )
    if(user.total <= 0 )return null
    
    return parseStringify(user.documents[0])

}

export const signOutUser = async() => {
    const { account} = await createSessionClient()
    try {
        // Delete the current session
        await account.deleteSession('current');
        (await cookies()).delete("appwrite-session")
    
        
    } catch (error) {
        handleError(error, 'Failed to sign out user')
    }
    finally{
        redirect('/sign-in')
    }
}

export const signInUser = async({email} : {email : string}) => {
    try{
        const existingUser = await getUserByEmail(email);
        //user exists, send OTP
        if(existingUser){
            await sendEmailOTP(email);
            return parseStringify({accounId : existingUser.accountId})
        }
        return parseStringify({accountId: null, error: 'User not found'})


    }
    catch(error){
        handleError(error,'Failed to sign in user')
    }
}