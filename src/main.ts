import { debug, getInput, info, setFailed, setOutput } from '@actions/core'
import { context } from '@actions/github'
import { getGitHubProjectV2ItemIDs } from './get-github-project-v2-items'

async function run(): Promise<void> {
  try {
    // [INPUT] gh_token
    const ghToken = getInput('gh_token')
    if (ghToken !== '') {
      info('[GitHub Token GET!]')
      debug(`gh_token: ${ghToken}`)
    } else {
      throw new Error(
        '[GitHub Token NOT SUPPLIED] gh_token must be supplied. It is used to authenticate the query. It could be your Personal Access Token (PAT) (not recommended) with org permission or token generated from your GitHub app with org permission (recommended)'
      )
    }

    // [INPUT] org
    let org = getInput('org')
    if (org !== '') {
      info('[Organization GET!]')
      debug(`org: ${org}`)
    } else {
      org = context.repo.owner
      info(`[Organization NOT SUPPLIED] Defaults to ${org}`)
    }

    // [INPUT] project_number
    const projectNumber = getInput('project_number')
    if (projectNumber !== '') {
      info('[Project Number GET!]')
      debug(`project_number: ${projectNumber}`)
    } else {
      throw new Error(
        '[Project Number NOT SUPPLIED] project_number must be supplied. It is used to identify your GitHub Project'
      )
    }

    // [INPUT] repo
    const repo = getInput('repo')
    if (repo !== '') {
      info('[Repository GET!]')
      debug(`repo: ${repo}`)
    } else {
      info(
        `[Repository NOT SUPPLIED] It is used to filter the items by repository in your GitHub Project.`
      )
    }

    // [INPUT] single_select_field_id and single_select_field_option_id
    const ssfId = getInput('single_select_field_id')
    const ssfOptionId = getInput('single_select_field_option_id')

    const isSsfIdSupplied = ssfId !== ''
    const isSsfOptionIdSupplied = ssfOptionId !== ''

    if (isSsfIdSupplied) {
      info('[Single Select Field ID GET!]')
      debug(`single_select_field_id: ${ssfId}`)

      if (!isSsfOptionIdSupplied) {
        throw new Error(
          '[Single Select Field Option ID GET FAILED] Cannot filter items by the single select field without single_select_field_option_id.'
        )
      } else {
        info('[Single Select Field Option ID GET!]')
        debug(`single_select_option_id: ${ssfOptionId}`)
      }
    } else {
      info(
        '[Single Select Field ID NOT SUPPLIED] It is used to filter the items by single select field in your GitHub Project.'
      )

      if (isSsfOptionIdSupplied) {
        info('[Single Select Field Option ID GET!]')
        debug(`single_select_option_id: ${ssfOptionId}`)
      } else {
        throw new Error(
          '[Single Select Field ID GET FAILED] Cannot filter items by the single select field option without single_select_field_id.'
        )
      }
    }

    // [INPUT] label_name
    const labelName = getInput('label_name')
    if (labelName !== '') {
      info('[Label Name GET!]')
      debug(`label_name: ${labelName}`)
    } else {
      info(
        '[Label Name NOT SUPPLIED] It is used to filter the items by label in your GitHub Project.'
      )
    }

    const itemIds = await getGitHubProjectV2ItemIDs({
      ghToken,
      org,
      projectNumber: parseInt(projectNumber),
      filter: {
        repo: { name: repo },
        ssf: { id: ssfId, optionId: ssfOptionId },
        label: { name: labelName }
      }
    })

    // [OUTPUT] item_ids_json
    if (itemIds) {
      setOutput('item_ids_json', JSON.stringify(itemIds))
    }
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

run()
