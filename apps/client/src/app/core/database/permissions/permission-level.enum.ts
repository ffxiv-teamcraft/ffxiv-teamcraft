export enum PermissionLevel {
  // These are one 10 by 10 in order to make sure we can put some in the middle in case we need new permission levels.
  // NONE is set to 1 to avoid it evaluating to false in the registry system.
  NONE = 1,
  READ = 10,
  PARTICIPATE = 20,
  WRITE = 30,
  OWNER = 40
}
