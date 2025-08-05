
// export default function BookmarksPage() {
//   return (
//     <div>
//       <h1>My Bookmarks</h1>
//       <p>Here are the roles you’ve saved for later.</p>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { defaultData } from "../data/defaultData";
import type { Role } from "../types/types";

export default function BookmarksPage() {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    async function fetchBookmarks() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("User not logged in.");
        return;
      }

      const { data, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("role_id")
        .eq("user_id", user.id);

      if (bookmarksError) {
        console.error("Failed to load bookmarks:", bookmarksError);
        return;
      }

      const bookmarkedRoles = defaultData.roles.filter((r) =>
        data.some((b) => b.role_id === r.id)
      );
      setRoles(bookmarkedRoles);
    }

    fetchBookmarks();
  }, []);

  return (
    <div className="page">
      <h1>My Bookmarks</h1>
      {roles.length === 0 ? (
        <p>You have no bookmarks yet.</p>
      ) : (
        <div className="cards">
          {roles.map((role) => (
            <div key={role.id} className="card">
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
