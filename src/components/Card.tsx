'use client'
import { Models } from "node-appwrite";
import Link from "next/link";
import {Thumbnail} from "@/src/components/Thumbnail";
import { convertFileSize } from "@/src/lib/utils";
import { FormattedDateTime } from "@/src/components/FormattedDateTime";
import ActionDropdown from "./ActionDropdown";
import { FileDoc } from "@/src/types";


const Card = ({ file }: { file: FileDoc }) => {
  return (
    <Link href={file.url} target="_blank" className="file-card">
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
          imageClassName="!size-11"
        />

        <div className="flex flex-col items-end justify-between">
          <ActionDropdown file={file} />
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>

      <div className="file-card-details">
        <p className="subtitle-2 line-clamp-1">{file.name}</p>
        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-100"
        />
        <p className="caption line-clamp-1 text-light-200">
          By: Rubi Adhikari
        </p>
      </div>
    </Link>
  );
};
export default Card;