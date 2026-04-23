const withStrictModeFallback = async (
  action: (isFallback: boolean) => Promise<void | string[]>
): Promise<void | string[]> => {
  try {
    return await action(false)
  } catch (error: any) {
    if (error?.message?.includes('strict mode violation')) {
      return await action(true)
    }
    throw error
  }
}

export { withStrictModeFallback }
