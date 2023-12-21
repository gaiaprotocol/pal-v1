import { serveWithOptions } from "../_shared/cors.ts";
import supabase, { getSignedUser } from "../_shared/supabase.ts";

serveWithOptions(async (req) => {
  const user = await getSignedUser(req);
  if (!user) throw new Error("Unauthorized");

  const { data: usersPublicData, error: usersPublicError } = await supabase
    .from("users_public").select("profile_image_stored").eq("user_id", user.id);
  if (usersPublicError) throw usersPublicError;

  const stored = usersPublicData?.[0]?.profile_image_stored;
  if (stored === false) {
    let url: string | undefined = user.user_metadata.avatar_url;
    let thumbnailUrl: string | undefined;

    if (url?.includes("_normal")) {
      thumbnailUrl = url;
      url = url.replace("_normal", "");
    } else {
      thumbnailUrl = url;
    }

    if (url) {
      const result = await fetch(url);
      if (!result.body) throw new Error("Failed to fetch avatar");

      const { error: storeError } = await supabase.storage.from(
        "user_profile_images",
      ).upload(
        `${user.id}/profile-image.png`,
        result.body,
        { contentType: "image/png", upsert: true },
      );
      if (storeError) throw storeError;

      const { data: { publicUrl } } = supabase.storage.from(
        "user_profile_images",
      )
        .getPublicUrl(`${user.id}/profile-image.png`);

      url = publicUrl;
    }

    if (thumbnailUrl) {
      const result = await fetch(thumbnailUrl);
      if (!result.body) throw new Error("Failed to fetch avatar");

      const { error: storeError } = await supabase.storage.from(
        "user_profile_images",
      ).upload(
        `${user.id}/profile-image-thumbnail.png`,
        result.body,
        { contentType: "image/png", upsert: true },
      );
      if (storeError) throw storeError;

      const { data: { publicUrl } } = supabase.storage.from(
        "user_profile_images",
      )
        .getPublicUrl(`${user.id}/profile-image-thumbnail.png`);

      thumbnailUrl = publicUrl;
    }

    const { error: updateError } = await supabase.from("users_public").update({
      profile_image_stored: true,
      stored_profile_image: url?.startsWith("http://supabase_kong_sofia:8000/")
        ? url.replace(
          "http://supabase_kong_sofia:8000/",
          "http://localhost:54321/",
        )
        : url,
      stored_profile_image_thumbnail:
        thumbnailUrl?.startsWith("http://supabase_kong_sofia:8000/")
          ? thumbnailUrl.replace(
            "http://supabase_kong_sofia:8000/",
            "http://localhost:54321/",
          )
          : thumbnailUrl,
    })
      .eq("user_id", user.id);
    if (updateError) throw updateError;
  }
});
