import bcrypt from 'bcryptjs';

/**
 * Hashes a password using bcrypt
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain text password with a hash
 * @param password The plain text password
 * @param hash The hashed password to compare against
 * @returns True if the password matches the hash, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
