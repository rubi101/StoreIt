'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getFiles } from '@/src/lib/actions/file.actions'
import {Thumbnail} from './Thumbnail'
import {FormattedDateTime} from './FormattedDateTime'
import { useDebounce } from 'use-debounce'
import { FileDoc } from '../types'

const Search = () => {
  const [query,setQuery] = useState('')
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("query") || ""
  const [results, setResults] = useState<FileDoc[]>([])
  const [open,setOpen] = useState(false)
  const router = useRouter()
  const path = usePathname()
  const [debouncedQuery] = useDebounce(query,300)

  useEffect(()=> {
    const fetchFiles = async () => {

      if(debouncedQuery.length === 0){
        setResults([])
        setOpen(false)
        return router.push(path)
      }
      const files = await getFiles({ types:[],searchText: debouncedQuery})

      setResults(files.documents)
      setOpen(true)

    }
    fetchFiles()
  },[debouncedQuery, path, router])

  useEffect(()=>{
    if(!searchQuery){
      setQuery("")
    }
  },[searchQuery])

  const handleClickItem = (file : FileDoc) => {
    setOpen(false)
    setResults([])

     let route = '';
  if (file.type === "video" || file.type === "audio") route = "/media";
  else if (file.type === "image") route = "/images";
  else if (file.type === "document") route = "/documents";
  else route = `/${file.type}s`;

  // Use file.name as search query
  router.push(`${route}?query=${encodeURIComponent(file.name)}`);

  }


  return (
    <div className='search'>
      <div className="search-input-wrapper">
        <Image 
          src="/assets/icons/search.svg"
          alt = "Search"
          width={24}
          height={24}
        />
        <Input 
          value={query}
          placeholder='Search.....'
          className='search-input'
          onChange={(e) => setQuery(e.target.value)}

        />

        {open && <ul className='search-result'>
          {results.length > 0 ? (

            results.map((file)=><li key={file.$id}  onClick ={() => handleClickItem(file)} className='flex items-center justify-between'>
              <div className="flex cursor-pointer items-center gap-4" >
                <Thumbnail
                  type={file.type}
                  extension= {file.extension}
                  url={file.url}
                  className='size-9 min-w-9'
                />
                <p className="subtitle-2 line-clamp-1 text-light-100">{file.name}</p>
              </div>
              <FormattedDateTime date = {file.$createdAt} className="caption line-clamp-1 text-light-200"/>
              </li>)
          ) : (
            <p className="empty-result">No Files found!</p>
          )}
          
        </ul>}
      </div>
    </div>
  )
}

export default Search
