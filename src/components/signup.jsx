import {useEffect, useState} from "react";
import Error from "./error";
import {Input} from "./ui/input";
import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {Button} from "./ui/button";
import {useNavigate, useSearchParams} from "react-router-dom";
import {signup} from "@/db/apiAuth";
import {BeatLoader} from "react-spinners";
import useFetch from "@/hooks/use-fetch";

const Signup = () => {
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: null,
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleInputChange = (e) => {
    const {name, value, files} = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };

  const {loading, error, fn: fnSignup, data} = useFetch(signup, formData);

  useEffect(() => {
    if (error === null && data) {
      if (data.session) {
        // User is immediately authenticated (email confirmation disabled)
        navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
      } else if (data.user && !data.session) {
        // Email confirmation required
        setShowSuccessMessage(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, data]);

  const handleSignup = async () => {
    setErrors([]);
    setShowSuccessMessage(false);
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
        profile_pic: Yup.mixed().required("Profile picture is required"),
      });

      await schema.validate(formData, {abortEarly: false});
      await fnSignup();
    } catch (error) {
      const newErrors = {};
      if (error?.inner) {
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });

        setErrors(newErrors);
      } else {
        setErrors({api: error.message});
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signup</CardTitle>
        <CardDescription>
          Create a new account if you haven&rsquo;t already
        </CardDescription>
        {error && <Error message={error?.message} />}
        
        {/* Success message for email confirmation */}
        {showSuccessMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold">Check your email!</p>
            <p>We've sent a confirmation link to {formData.email}. Please check your inbox and confirm your email to complete registration.</p>
          </div>
        )}
      </CardHeader>
      
      {!showSuccessMessage ? (
        <>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Input
                name="name"
                type="text"
                placeholder="Enter Name"
                onChange={handleInputChange}
              />
            </div>
            {errors.name && <Error message={errors.name} />}
            <div className="space-y-1">
              <Input
                name="email"
                type="email"
                placeholder="Enter Email"
                onChange={handleInputChange}
              />
            </div>
            {errors.email && <Error message={errors.email} />}
            <div className="space-y-1">
              <Input
                name="password"
                type="password"
                placeholder="Enter Password"
                onChange={handleInputChange}
              />
            </div>
            {errors.password && <Error message={errors.password} />}
            <div className="space-y-1">
              <input
                name="profile_pic"
                type="file"
                accept="image/*"
                onChange={handleInputChange}
              />
            </div>
            {errors.profile_pic && <Error message={errors.profile_pic} />}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSignup}>
              {loading ? (
                <BeatLoader size={10} color="#36d7b7" />
              ) : (
                "Create Account"
              )}
            </Button>
          </CardFooter>
        </>
      ) : (
        <CardContent>
          <div className="text-center py-4">
            <p className="text-lg mb-4">🎉 Account created successfully!</p>
            <p>Please check your email to confirm your account.</p>
            {/* <Button 
              onClick={() => navigate('/auth')} 
              className="mt-4"
              variant="outline"
            >
              Back to Login
            </Button> */}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default Signup;