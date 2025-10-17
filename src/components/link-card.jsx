/* eslint-disable react/prop-types */
import {Copy, Download, LinkIcon, Trash} from "lucide-react";
import {Link} from "react-router-dom";
import {Button} from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import {deleteUrl} from "@/db/apiUrls";
import {BeatLoader} from "react-spinners";

const LinkCard = ({url = [], fetchUrls}) => {
  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = url?.title;

    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const {loading: loadingDelete, fn: fnDelete} = useFetch(deleteUrl, url.id);

  return (
    <div className="flex flex-col md:flex-row gap-4 border p-4 bg-gray-900 rounded-lg w-full">
      {/* QR Code - Fixed size and proper alignment */}
      <div className="flex-shrink-0 self-center md:self-start">
        <img
          src={url?.qr}
          className="h-28 w-28 object-contain ring-2 ring-blue-500 rounded"
          alt="qr code"
        />
      </div>

      {/* URL Details - Takes remaining space */}
      <div className="flex-1 min-w-0"> {/* min-w-0 prevents overflow */}
        <Link to={`/link/${url?.id}`} className="block space-y-2">
          <h3 className="text-xl font-bold hover:underline cursor-pointer truncate">
            {url?.title}
          </h3>
          <p className="text-lg text-blue-400 font-semibold hover:underline cursor-pointer break-words">
            https://url-shortener-pi-hazel.vercel.app/
            {url?.custom_url ? url?.custom_url : url.short_url}
          </p>
          <p className="flex items-start gap-1 text-gray-300 hover:underline cursor-pointer break-words">
            <LinkIcon className="h-4 w-4 mt-1 flex-shrink-0" />
            <span className="break-all">{url?.original_url}</span>
          </p>
          <p className="text-sm text-gray-400">
            {new Date(url?.created_at).toLocaleString()}
          </p>
        </Link>
      </div>

      {/* Action Buttons - Properly aligned */}
      <div className="flex md:flex-col gap-2 justify-center md:justify-start">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigator.clipboard.writeText(
              `https://url-shortener-pi-hazel.vercel.app/${url?.short_url}`
            )
          }
          className="h-10 w-10 p-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={downloadImage}
          className="h-10 w-10 p-0"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fnDelete().then(() => fetchUrls())}
          disabled={loadingDelete}
          className="h-10 w-10 p-0"
        >
          {loadingDelete ? (
            <BeatLoader size={3} color="white" />
          ) : (
            <Trash className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default LinkCard;