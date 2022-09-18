import { ProjectV2Item } from '@octokit/graphql-schema'

export const getIDFromItem = (item: ProjectV2Item): string => {
  return item.id
}
