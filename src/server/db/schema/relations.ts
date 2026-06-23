import { relations } from 'drizzle-orm'
import { rooms, roomMembers } from './rooms'
import { questionSets, questions } from './questions'
import { nameListEntries, votes, voteSelections, resultViews } from './votes'
import { user } from './auth'
import { permissionBundles, coOwnerPermissions } from './permissions'

export const userRelations = relations(user, ({ many }) => ({
  ownedRooms: many(rooms),
  roomMembers: many(roomMembers),
}))

export const roomRelations = relations(rooms, ({ one, many }) => ({
  owner: one(user, { fields: [rooms.ownerId], references: [user.id] }),
  roomMembers: many(roomMembers),
  questionSets: many(questionSets),
  nameListEntries: many(nameListEntries),
  coOwnerPermissions: many(coOwnerPermissions),
}))

export const roomMemberRelations = relations(roomMembers, ({ one }) => ({
  room: one(rooms, { fields: [roomMembers.roomId], references: [rooms.id] }),
  user: one(user, { fields: [roomMembers.userId], references: [user.id] }),
}))

export const questionSetRelations = relations(questionSets, ({ one, many }) => ({
  room: one(rooms, { fields: [questionSets.roomId], references: [rooms.id] }),
  questions: many(questions),
}))

export const questionRelations = relations(questions, ({ one, many }) => ({
  questionSet: one(questionSets, { fields: [questions.questionSetId], references: [questionSets.id] }),
  votes: many(votes),
}))

export const nameListEntryRelations = relations(nameListEntries, ({ one }) => ({
  room: one(rooms, { fields: [nameListEntries.roomId], references: [rooms.id] }),
  member: one(roomMembers, { fields: [nameListEntries.memberId], references: [roomMembers.id] }),
}))

export const voteRelations = relations(votes, ({ one, many }) => ({
  question: one(questions, { fields: [votes.questionId], references: [questions.id] }),
  voter: one(roomMembers, { fields: [votes.voterMemberId], references: [roomMembers.id] }),
  voteSelections: many(voteSelections),
}))

export const voteSelectionRelations = relations(voteSelections, ({ one }) => ({
  vote: one(votes, { fields: [voteSelections.voteId], references: [votes.id] }),
  nameEntry: one(nameListEntries, { fields: [voteSelections.nameEntryId], references: [nameListEntries.id] }),
}))

export const permissionBundleRelations = relations(permissionBundles, ({ one, many }) => ({
  createdBy: one(user, { fields: [permissionBundles.createdBy], references: [user.id] }),
  coOwnerPermissions: many(coOwnerPermissions),
}))

export const coOwnerPermissionRelations = relations(coOwnerPermissions, ({ one }) => ({
  room: one(rooms, { fields: [coOwnerPermissions.roomId], references: [rooms.id] }),
  user: one(user, { fields: [coOwnerPermissions.userId], references: [user.id] }),
  permissionBundle: one(permissionBundles, { fields: [coOwnerPermissions.permissionBundleId], references: [permissionBundles.id] }),
}))

export const resultViewRelations = relations(resultViews, ({ one }) => ({
  room: one(rooms, { fields: [resultViews.roomId], references: [rooms.id] }),
}))