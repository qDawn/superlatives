import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as authSchema from './schema/auth'
import * as roomSchema from './schema/rooms'
import * as permissionSchema from './schema/permissions'
import * as questionSchema from './schema/questions'
import * as voteSchema from './schema/votes'
import * as relations from './schema/relations'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, {
  schema: {
    ...authSchema,
    ...roomSchema,
    ...permissionSchema,
    ...questionSchema,
    ...voteSchema,
    ...relations,
  }
})