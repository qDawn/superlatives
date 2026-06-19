import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as userSchema from './schema/users'
import * as roomSchema from './schema/rooms'
import * as permissionSchema from './schema/permissions'
import * as questionSchema from './schema/questions'
import * as voteSchema from './schema/votes'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, {
  schema: {
    ...userSchema,
    ...roomSchema,
    ...permissionSchema,
    ...questionSchema,
    ...voteSchema,
  }
})