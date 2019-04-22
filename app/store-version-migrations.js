import compose from './utils/compose'

function v1Tov2(v1Store) {
  console.warn(`migrating v1 to v2`, v1Store)
  return v1Store
}

function v2Tov3(v2Store) {
  /*
   * conversions from v2 to v3
   * */
  return v2Store
}

export const storeVersionMigrations = [v1Tov2, v2Tov3]

export function updateStoreToCurrentVersion(oldStore, oldStoreVersion, currentStoreVersion) {
  if (!oldStoreVersion || oldStoreVersion === currentStoreVersion) {
    return oldStore
  }

  /*
   * generates an array of all migrations from the currently stored store version to the
   * actual current store version
   * * - 1 since we started store version at 1 but the storeVersionMigrations
   * array starts at 0
   * */
  const migrationsToBeApplied = storeVersionMigrations.slice(oldStoreVersion - 1, currentStoreVersion - 1)

  /*
   * composes all migration-functions into a single one that will call all of them one after
   * the other given the input of the previous one and passes it the old store
   * */
  return compose(...migrationsToBeApplied)(oldStore)
}
