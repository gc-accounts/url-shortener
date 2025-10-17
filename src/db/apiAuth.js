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
    // First, create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (authError) throw new Error(authError.message);

    // If profile picture is provided, upload it
    if (profile_pic) {
      const fileName = `dp-${name.split(" ").join("-")}-${Date.now()}`;
      
      const { error: storageError } = await supabase.storage
        .from("profile_pic")
        .upload(fileName, profile_pic);

      if (storageError) throw new Error(storageError.message);

      // Update user metadata with profile picture URL
      const profilePicUrl = `${supabaseUrl}/storage/v1/object/public/profile_pic/${fileName}`;
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: { profile_pic: profilePicUrl }
      });

      if (updateError) throw new Error(updateError.message);
    }

    return authData;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const {data: session, error} = await supabase.auth.getSession();
  if (!session.session) return null;

  // const {data, error} = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return session.session?.user;
}

export async function logout() {
  const {error} = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
