"use client"
import React, { useState } from "react"
import {  email, z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/src/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import Link from "next/link"
import { createAccount, signInUser } from "@/src/lib/actions/user.actions"
import OTPModal from "./OTPModal"




type FormType = "sign-in" | "sign-up"

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string()
      .min(1, "Email is required")
      .email("Invalid email format"),
      
    fullName: formType === "sign-up"
      ? z.string()
          .min(2, "Full name must be at least 2 characters")
          .max(50, "Full name must be under 50 characters")
      : z.string().optional(),
  })
}




const AuthForm = ( {type}:{ type : FormType }) => {
 const[isLoading, setIsLoading] = useState(false)
 const[errorMessage, setErrorMessage] = useState("")
 const [accountId, setAccountId] = useState(null)

 const formSchema = authFormSchema(type)

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName:"",
      email:""
    },
  })

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    setErrorMessage("")
    try {
      const user =
        
        await createAccount({fullName: values.fullName || " " ,email : values.email})
       setAccountId(user.accountId) 
      
    } catch (error) {
      setErrorMessage('Failed to create account. Please try again')
      
    }
    finally{
      setIsLoading(false)
    }

    
  }
  return (

    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <h1 className="form-title">
            {type == 'sign-in' ? "Sign In" : "Sign Up"}

        </h1>
        {type == "sign-up"&& <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
                <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Full Name</FormLabel>

                    <FormControl>
                        <Input placeholder="Enter your full name" className="shad-input" {...field} />
                    </FormControl>
                </div>
             
              
              
              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
        /> }
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
                <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Email</FormLabel>

                    <FormControl>
                        <Input placeholder="Enter your email" className="shad-input" {...field} />
                    </FormControl>
                </div>
             
              
              
              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
        />
        <Button type="submit" className="form-submit-button" disabled = {isLoading}>
            {type == "sign-in"? "Sign In" : "Sign Up"}
            {isLoading &&  <img src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="animate-spin ml-2" />}
           
        </Button>
        {errorMessage && <p className="error-message">*{errorMessage}</p>}
        <div className="body-2 flex justify-center">
            <p className="text-light-100">
                {type == "sign-in"? "Don't have an account?": "Already have an account?"}
            </p>
            <Link href={type == "sign-in"? "/sign-up":"/sign-in"} className="ml-1 font-medium text-brand">{type == "sign-in"? "Sign Up" : "Sign In"}</Link>
        </div>
      </form>
    </Form>

    {/* opt verfication */}

    {accountId && <OTPModal email = {form.getValues('email')} accountId = {accountId}/>}


    </>
  )

 
}

export default AuthForm
