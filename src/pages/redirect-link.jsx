import { storeClicks } from "@/db/apiClicks";
import { getLongUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

const RedirectLink = () => {
  const { id } = useParams();
  const [storingClick, setStoringClick] = useState(false);

  const { loading, data, error, fn } = useFetch(getLongUrl, id);

  useEffect(() => {
    fn();
  }, [fn]);

  useEffect(() => {
    const storeAndRedirect = async () => {
      if (!loading && data && data.original_url && !storingClick) {
        setStoringClick(true);
        console.log('📊 Starting click storage and redirect process...');
        
        try {
          // Store click directly (not using useFetch)
          console.log('💾 Storing click for URL:', data.id);
          await storeClicks({ 
            id: data.id, 
            originalUrl: data.original_url 
          });
          
          console.log('✅ Click stored successfully');
          console.log('🔗 Redirecting to:', data.original_url);
          
          // Perform the actual redirection
          window.location.href = data.original_url;
          
        } catch (error) {
          console.error('❌ Error in redirect process:', error);
          // Still redirect even if click storage fails
          console.log('🔄 Redirecting despite error...');
          window.location.href = data.original_url;
        }
      }
    };

    storeAndRedirect();
  }, [loading, data, storingClick]);

  // Show loading state
  if (loading || storingClick) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <BarLoader width={"100%"} color="#36d7b7" />
        <br />
        <p>Loading...</p>
        <p className="text-sm text-gray-500 mt-2">Short code: {id}</p>
      </div>
    );
  }

  // Show error state
  if (error || (!loading && !data)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Short URL not found</h1>
        <p className="text-gray-600">The link you're trying to access doesn't exist or has been deleted.</p>
        <p className="text-sm text-gray-500 mt-2">Short code: {id}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <BarLoader width={"100%"} color="#36d7b7" />
      <br />
      <p>Finalizing redirect...</p>
      <p className="text-sm text-gray-500 mt-2">Short code: {id}</p>
    </div>
  );
};

export default RedirectLink;