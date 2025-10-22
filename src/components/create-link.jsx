import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Card} from "./ui/card";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import Error from "./error";
import * as yup from "yup";
import useFetch from "@/hooks/use-fetch";
import {createUrl} from "@/db/apiUrls";
import {BeatLoader} from "react-spinners";
import {UrlState} from "@/context";
import {QRCode} from "react-qrcode-logo";

export function CreateLink() {
  const {user} = UrlState();

  const navigate = useNavigate();
  const ref = useRef();

  let [searchParams, setSearchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    title: "",
    longUrl: longLink ? longLink : "",
    customUrl: "",
    campaignId: "",
    source: "",
    // utmSource: "",
    medium: "",
    campaignName: "",
    term: "",
    content: ""
  });

  const [fullUrl, setFullUrl] = useState("");

  // Generate full URL with UTM parameters
  useEffect(() => {
    if (formValues.longUrl) {
      const params = new URLSearchParams();

      // Add all UTM fields only if not empty
      if (formValues.source) params.set('utm_source', formValues.source);
      // if (formValues.utmSource.trim()) params.set('utm_custom_source', formValues.utmSource.trim());
      if (formValues.medium) params.set('utm_medium', formValues.medium);
      if (formValues.campaignName) params.set('utm_campaign', formValues.campaignName);
      if (formValues.campaignId) params.set('utm_id', formValues.campaignId);
      if (formValues.term) params.set('utm_term', formValues.term);
      if (formValues.content) params.set('utm_content', formValues.content);

      const separator = formValues.longUrl.includes('?') ? '&' : '?';
      setFullUrl(`${formValues.longUrl}${separator}${params.toString()}`);
    } else {
      setFullUrl("");
    }
  }, [formValues]);

  const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    longUrl: yup
      .string()
      .url("Must be a valid URL")
      .required("Long URL is required"),
    customUrl: yup.string(),
    campaignId: yup.string(),
    source: yup.string(),
    // utmSource: yup.string(),
    medium: yup.string(),
    campaignName: yup.string(),
    term: yup.string(),
    content: yup.string()
  });

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const {
    loading,
    error,
    data,
    fn: fnCreateUrl,
  } = useFetch(createUrl, {...formValues, user_id: user.id, longUrl: fullUrl || formValues.longUrl});

  useEffect(() => {
    if (error === null && data) {
      navigate(`/link/${data[0].id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, data]);

  const createNewLink = async () => {
    setErrors([]);
    try {
      await schema.validate(formValues, {abortEarly: false});

      const canvas = ref.current.canvasRef.current;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));

      // Use the full URL with UTM parameters for the short link
      const createData = {
        ...formValues,
        user_id: user.id,
        longUrl: fullUrl || formValues.longUrl
      };

      await fnCreateUrl(blob, createData);
    } catch (e) {
      const newErrors = {};

      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });

      setErrors(newErrors);
    }
  };

  return (
    <Dialog
      defaultOpen={longLink}
      onOpenChange={(res) => {
        if (!res) setSearchParams({});
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">Create New Link</DialogTitle>
        </DialogHeader>
        
        {formValues?.longUrl && (
          <QRCode ref={ref} size={200} value={fullUrl || formValues?.longUrl} />
        )}

        <div className="space-y-4">
          {/* Basic URL Fields */}
          <div className="space-y-2">
            <Input
              id="title"
              name="title"
              placeholder="Short Link's Title"
              value={formValues.title}
              onChange={handleChange}
            />
            {errors.title && <Error message={errors.title} />}
          </div>

          <div className="space-y-2">
            <Input
              id="longUrl"
              name="longUrl"
              placeholder="Enter your Website URL (https://www.example.com)"
              value={formValues.longUrl}
              onChange={handleChange}
            />
            {errors.longUrl && <Error message={errors.longUrl} />}
          </div>

          {/* UTM Tracking Fields */}
          <div className="space-y-2">
            <Input
              name="campaignId"
              placeholder="Campaign ID"
              value={formValues.campaignId}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Input
              name="source"
              placeholder="Source (Original Traffic Source) - youtube, instagram, facebook"
              value={formValues.source}
              onChange={handleChange}
            />
          </div>

          {/* <div className="space-y-2">
            <Input
              name="utmSource"
              placeholder="UTM Source (Custom)"
              value={formValues.utmSource}
              onChange={handleChange}
            />
          </div> */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign Medium (Original Traffic Source Drill Down 1)</label>
            <select
              name="medium"
              value={formValues.medium}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            >
              <option value="">Select a medium</option>
              <option value="Email Marketing">Email Marketing</option>
              <option value="Paid Search">Paid Search</option>
              <option value="Organic Social">Organic Social</option>
              <option value="Paid Social">Paid Social</option>
              <option value="Other Campaigns">Other Campaigns</option>
            </select>
          </div>

          <div className="space-y-2">
            <Input
              name="campaignName"
              placeholder="Campaign Name (Original Traffic Source Drill Down 2)"
              value={formValues.campaignName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Input
              name="term"
              placeholder="Campaign Term (UTM Term-First Page Seen)"
              value={formValues.term}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Input
              name="content"
              placeholder="Campaign Content (UTM Content-First Page Seen)"
              value={formValues.content}
              onChange={handleChange}
            />
          </div>

          {/* Generated Full URL Display */}
          {fullUrl && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-md text-black">
              <label className="text-sm font-medium">Generated Full URL</label>
              <div className="text-sm text-gray-600 break-all">
                {fullUrl}
              </div>
            </div>
          )}

          {/* Custom URL Field */}
          <div className="flex items-center gap-2">
            <Card className="p-2">https://link.odinschool.com</Card> /
            <Input
              id="customUrl"
              name="customUrl"
              placeholder="Custom Link (optional)"
              value={formValues.customUrl}
              onChange={handleChange}
            />
          </div>
          {errors.customUrl && <Error message={errors.customUrl} />}
        </div>

        {error && <Error message={error.message} />}
        
        <DialogFooter className="sm:justify-start mt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={createNewLink}
            disabled={loading}
          >
            {loading ? <BeatLoader size={10} color="white" /> : "Create Short Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}