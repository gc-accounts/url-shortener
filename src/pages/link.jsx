import DeviceStats from "@/components/device-stats";
import Location from "@/components/location-stats";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {UrlState} from "@/context";
import {getClicksForUrl} from "@/db/apiClicks";
import {deleteUrl, getUrl} from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import {Copy, Download, LinkIcon, Trash} from "lucide-react";
import {useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {BarLoader, BeatLoader} from "react-spinners";

const LinkPage = () => {
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
  
  const navigate = useNavigate();
  const {user} = UrlState();
  const {id} = useParams();
  const {
    loading,
    data: url,
    fn,
    error,
  } = useFetch(getUrl, {id, user_id: user?.id});

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats,
  } = useFetch(getClicksForUrl, id);

  const {loading: loadingDelete, fn: fnDelete} = useFetch(deleteUrl, id);

  useEffect(() => {
    fn();
  }, []);

  useEffect(() => {
    if (!error && loading === false) fnStats();
  }, [loading, error]);

  if (error) {
    navigate("/dashboard");
  }

  let link = "";
  if (url) {
    link = url?.custom_url ? url?.custom_url : url.short_url;
  }

  return (
    <>
      {(loading || loadingStats) && (
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
      )}
      <div className="flex flex-col gap-8 sm:flex-row justify-between">
        {/* Left Section - URL Details */}
        <div className="flex flex-col items-start gap-6 rounded-lg sm:w-2/5">
          <h1 className="text-4xl sm:text-5xl font-extrabold hover:underline cursor-pointer break-words">
            {url?.title}
          </h1>
          
          <a
            href={`https://url-shortener-pi-hazel.vercel.app/${link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl sm:text-2xl text-blue-400 font-bold hover:underline cursor-pointer break-words w-full"
          >
            https://url-shortener-pi-hazel.vercel.app/{link}
          </a>
          
          {/* Fixed URL section - prevents horizontal scroll */}
          <div className="w-full">
            <a
              href={url?.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 hover:underline cursor-pointer group w-full"
            >
              <LinkIcon className="h-5 w-5 mt-1 flex-shrink-0" />
              <span className="text-gray-300 break-all text-sm sm:text-base">
                {url?.original_url}
              </span>
            </a>
          </div>

          <span className="text-sm text-gray-400">
            {new Date(url?.created_at).toLocaleString()}
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigator.clipboard.writeText(`https://url-shortener-pi-hazel.vercel.app/${link}`)
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadImage}>
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                fnDelete().then(() => {
                  navigate("/dashboard");
                })
              }
              disabled={loadingDelete}
            >
              {loadingDelete ? (
                <BeatLoader size={5} color="white" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <img
            src={url?.qr}
            className="w-full max-w-xs self-center sm:self-start ring-2 ring-blue-500 p-2 rounded object-contain"
            alt="qr code"
          />
        </div>

        {/* Right Section - Stats */}
        <Card className="sm:w-3/5">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold">Stats</CardTitle>
          </CardHeader>
          {stats && stats.length ? (
            <CardContent className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats?.length}</p>
                </CardContent>
              </Card>

              <CardTitle className="text-xl">Location Data</CardTitle>
              <Location stats={stats} />
              <CardTitle className="text-xl">Device Info</CardTitle>
              <DeviceStats stats={stats} />
            </CardContent>
          ) : (
            <CardContent>
              {loadingStats === false
                ? "No Statistics yet"
                : "Loading Statistics.."}
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
};

export default LinkPage;