export const Space = () => {
  return (
    <div className="relative py-5">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div className="mx-auto h-[1px] w-11/12 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div className="mx-auto h-[1px] w-6/12 bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-70 blur-[1px]" />
      </div>
    </div>
  );
};
