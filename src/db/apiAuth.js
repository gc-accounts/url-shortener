import supabase, {supabaseUrl} from "./supabase";

export async function login({email, password}) {
  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function signup({name, email, password, profile_pic}) {
  try {
    let profilePicUrl = null;

    // Upload profile picture if provided
    if (profile_pic) {
      const fileName = `dp-${name.split(" ").join("-")}-${Date.now()}-${profile_pic.name}`;
      
      const { data: uploadData, error: storageError } = await supabase.storage
        .from("profile_pic")
        .upload(fileName, profile_pic);

      if (storageError) {
        console.error('Storage upload error:', storageError);
        // Don't throw error - continue without profile picture
      } else {
        profilePicUrl = `${supabaseUrl}/storage/v1/object/public/profile_pic/${fileName}`;
      }
    }

    // Create user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          profile_pic: profilePicUrl,
        },
      },
    });

    if (error) {
      console.error('Auth signup error:', error);
      throw new Error(error.message);
    }

    // Return success even if email confirmation is required
    return {
      user: data.user,
      session: data.session,
      needsConfirmation: !data.session // Flag to indicate email confirmation is needed
    };
  } catch (error) {
    console.error('Signup process error:', error);
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const {data: session, error} = await supabase.auth.getSession();
  if (!session.session) return null;

  if (error) throw new Error(error.message);
  return session.session?.user;
}

export async function logout() {
  const {error} = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}