/**
 * Creates (or re-points) the admin account for the events portal.
 *
 * Usage:
 *   node --env-file-if-exists=/vercel/share/.env.project \
 *     scripts/create-admin.mjs <email> <password>
 *
 * Uses the service-role key because two things the anon key cannot do are
 * required: creating a user with `email_confirm: true` (so no confirmation
 * email is needed), and inserting into `admin_users`, which has no
 * user-writable RLS policy by design.
 */
import { createClient } from "@supabase/supabase-js"

const [email, password] = process.argv.slice(2)

if (!email || !password) {
  console.error("Usage: create-admin.mjs <email> <password>")
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// Reuse the account if it already exists, so this script is safe to re-run.
const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 200 })
if (listError) {
  console.error("Could not list users:", listError.message)
  process.exit(1)
}

let user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

if (user) {
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  })
  if (error) {
    console.error("Could not update existing user:", error.message)
    process.exit(1)
  }
  user = data.user
  console.log(`[v0] reused existing account ${email}`)
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) {
    console.error("Could not create user:", error.message)
    process.exit(1)
  }
  user = data.user
  console.log(`[v0] created account ${email}`)
}

const { error: grantError } = await supabase
  .from("admin_users")
  .upsert({ user_id: user.id, email }, { onConflict: "user_id" })

if (grantError) {
  console.error("Could not grant admin access:", grantError.message)
  process.exit(1)
}

console.log(`[v0] granted admin access to ${email} (${user.id})`)
