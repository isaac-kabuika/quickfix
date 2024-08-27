const Illustration = ({ className, ...props }: IllustrationProps) => {
  return (
    <div
      className={cn(
        "relative aspect-[1/1] overflow-hidden rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100 shadow-2xl dark:from-slate-800 dark:to-slate-900",
        "before:absolute before:inset-0 before:-translate-y-1/2 before:translate-x-[-10%] before:rotate-[-10deg] before:bg-gradient-to-b before:from-blue-50 before:to-blue-100 before:dark:from-slate-800 before:dark:to-slate-900",
        "after:absolute after:inset-0 after:translate-y-1/2 after:translate-x-[-10%] after:rotate-[10deg] after:bg-gradient-to-b after:from-blue-50 after:to-blue-100 after:dark:from-slate-800 dark:to-slate-900",
        className
      )}
      {...props}
    />
  );
};