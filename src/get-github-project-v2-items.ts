import { debug } from '@actions/core'
import { ProjectV2Item } from '@octokit/graphql-schema'
import {
  filterItemsByLabel,
  filterItemsByRepo,
  filterItemsBySingleSelectField
} from './lib/filters'
import { getIDFromItem } from './lib/getter'
import { queryAllItems } from './lib/query'

type GetGitHubProjectV2ItemsParams = {
  ghToken: string
  org: string
  projectNumber: number
  filter?: GitHubProjectV2ItemsFilter
}

type GitHubProjectV2ItemsFilter = {
  repo?: { name: string }
  ssf?: { id: string; optionId: string }
  label?: { name: string }
}

export const getGitHubProjectV2ItemIDs = async ({
  ghToken,
  org,
  projectNumber,
  filter
}: GetGitHubProjectV2ItemsParams): Promise<string[]> => {
  let filteredItems: ProjectV2Item[] = []

  const allItems = await queryAllItems(ghToken, org, projectNumber)
  debug(`allItems: ${JSON.stringify(allItems)}`)

  // no filter
  if (!filter) {
    const allItemIds = allItems.map(item => getIDFromItem(item))

    debug(`allItemIds: ${JSON.stringify(allItemIds)}`)

    return allItemIds
  }

  const { repo, ssf, label } = filter
  filteredItems = allItems

  // filter by repo
  if (repo) {
    const itemsFilteredByRepo = filterItemsByRepo(filteredItems, repo.name)

    filteredItems = itemsFilteredByRepo
  }

  // filter by single select field
  if (ssf) {
    const itemsFilteredBySsf = filterItemsBySingleSelectField(
      filteredItems,
      ssf.id,
      ssf.optionId
    )

    filteredItems = itemsFilteredBySsf
  }

  // filter by label
  if (label) {
    const itemsFilteredByLabel = filterItemsByLabel(filteredItems, label.name)

    filteredItems = itemsFilteredByLabel
  }

  debug(`filteredItems: ${filteredItems}`)

  const filteredItemIds = filteredItems.map(item => getIDFromItem(item))

  debug(`filteredItemIds: ${JSON.stringify(filteredItemIds)}`)

  return filteredItemIds
}
