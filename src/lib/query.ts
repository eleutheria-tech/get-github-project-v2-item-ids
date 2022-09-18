import { debug, error } from "@actions/core"
import { getOctokit } from "@actions/github"
import { ProjectV2Item, Query } from "@octokit/graphql-schema"
import { GraphqlResponseError } from '@octokit/graphql'

export const queryAllItems = async (
    ghToken: string,
    org: string,
    projectNumber: number
  ): Promise<ProjectV2Item[]> => {
    const octokit = getOctokit(ghToken)
  
    const query = `
          query($org: String! $project_number: Int! $prev_cursor: String){
              __typename
              organization(login: $org){
                  __typename
                  projectV2(number: $project_number) {
                      __typename
                      id
                      items(first: 100,  after: $prev_cursor) {
                          __typename
                          totalCount
                          pageInfo {
                              endCursor
                              hasNextPage
                          }
                          edges {
                              cursor 
                              node {
                                  __typename
                                  ... on ProjectV2Item {
                                      id
                                      type
                                      content {
                                          __typename
                                          ...on Issue {
                                              number
                                              title
                                              url
                                          }
                                          ... on PullRequest {
                                              number
                                              title
                                              url
                                          }
                                      }
                                      fieldValues(first: 20) {
                                          ... on ProjectV2ItemFieldValueConnection {
                                              nodes {
                                                  __typename
                                                  ... on ProjectV2ItemFieldSingleSelectValue {
                                                      field {
                                                          ... on ProjectV2SingleSelectField {
                                                              id
                                                              name
                                                          }
                                                      }
                                                      optionId
                                                      name
                                                  }
                                                  ... on ProjectV2ItemFieldRepositoryValue {
                                                      field {
                                                          ... on ProjectV2Field {
                                                              id
                                                              name
                                                          }
                                                      }
                                                      repository {
                                                          nameWithOwner
                                                      }
                                                  }
                                                  ... on ProjectV2ItemFieldLabelValue {
                                                      field {
                                                          ... on ProjectV2Field {
                                                              id
                                                              name
                                                          }
                                                      }
                                                      labels( first: 20) {
                                                          nodes {
                                                              id
                                                              name
                                                          }
                                                      }
                                                  }
                                              }
                                          }
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          }
      `
  
    const itemsResult: ProjectV2Item[] = []
  
    let hasNextPage = true
    let prevCursor: string | null | undefined = null
  
    while (hasNextPage) {
      const variables = {
        org,
        project_number: projectNumber,
        prev_cursor: prevCursor
      }
  
      try {
        const result: Query = await octokit.graphql(query, variables)
        debug(`result: ${JSON.stringify(result)}`)
  
        const organization = result.organization
  
        if (!organization) {
          throw new Error('[Organization NOT FOUND]')
        }
  
        const { projectV2 } = organization
  
        if (!projectV2) {
          throw new Error('[Project V2 NOT FOUND]')
        }
  
        const { edges } = projectV2.items
  
        if (!edges) {
          throw new Error('[Items edges NOT FOUND]')
        }
  
        for (const edge of edges) {
          const node = edge?.node
          if (node) itemsResult.push(node)
        }
  
        const { pageInfo } = projectV2.items
  
        hasNextPage = pageInfo.hasNextPage
        debug(`hasNextPage: ${hasNextPage}`)
        prevCursor = pageInfo.endCursor
        debug(`prevCursor: ${prevCursor}`)
      } catch (err) {
        if (err instanceof GraphqlResponseError) {
          error(JSON.stringify(err.request))
          error(err.message)
          throw new Error('[GraphQL Request FAILED]')
        } else throw err
      }
    }
  
    return itemsResult
  }
  