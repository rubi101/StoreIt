import { cn, formatDateTime } from '@/src/lib/utils'
import React from 'react'

 export const FormattedDateTime = ({date,className} : {
    date : string | null,
    className?: string
 }) => {
  return (
    <p className= {cn("body-1 text-light-100",className)}>
        {formatDateTime(date)}
    </p>
  )
}
