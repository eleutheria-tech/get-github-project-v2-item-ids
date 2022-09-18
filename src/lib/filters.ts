import { debug } from '@actions/core'
import {
  ProjectV2Item,
  ProjectV2ItemFieldRepositoryValue,
  ProjectV2ItemFieldSingleSelectValue,
  ProjectV2ItemFieldLabelValue
} from '@octokit/graphql-schema'

export const filterItemsByRepo = (
  items: ProjectV2Item[],
  repoName: string
): ProjectV2Item[] => {
  const itemsFilteredByRepo = items.filter(item => {
    const { nodes } = item.fieldValues

    if (nodes) {
      const repoField = nodes.find(
        node => node?.__typename === 'ProjectV2ItemFieldRepositoryValue'
      )

      if (repoField) {
        const { repository } = repoField as ProjectV2ItemFieldRepositoryValue
        return repoName === repository?.nameWithOwner
      }
    }
  })

  debug(`itemsFilteredByRepo: ${JSON.stringify(itemsFilteredByRepo)}`)

  return itemsFilteredByRepo
}

export const filterItemsBySingleSelectField = (
  items: ProjectV2Item[],
  ssfId: string,
  ssfOptionId: string
): ProjectV2Item[] => {
  const itemsFilteredBySsf = items.filter(item => {
    const { nodes } = item.fieldValues

    if (nodes) {
      const ssf = nodes.find(
        node => node?.__typename === 'ProjectV2ItemFieldSingleSelectValue'
      )

      if (ssf) {
        const { field, optionId } = ssf as ProjectV2ItemFieldSingleSelectValue
        return field.id === ssfId && optionId === ssfOptionId
      }
    }
  })

  debug(`itemsFilteredBySsf: ${JSON.stringify(itemsFilteredBySsf)}`)

  return itemsFilteredBySsf
}

export const filterItemsByLabel = (
  items: ProjectV2Item[],
  labelName: string
): ProjectV2Item[] => {
  const itemsFilteredByLabel = items.filter(item => {
    const { nodes } = item.fieldValues

    if (nodes) {
      const labelField = nodes.find(
        node => node?.__typename === 'ProjectV2ItemFieldLabelValue'
      )

      if (labelField) {
        const labels = (labelField as ProjectV2ItemFieldLabelValue).labels
          ?.nodes

        if (labels) {
          for (const l of labels) {
            return l?.name === labelName
          }
        }
      }
    }
  })

  debug(`itemsFilteredByLabel: ${JSON.stringify(itemsFilteredByLabel)}`)

  return itemsFilteredByLabel
}
