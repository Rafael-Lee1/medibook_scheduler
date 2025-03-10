
export const FreePayment = () => {
  return (
    <div className="py-4 text-center">
      <p className="mb-4">This exam will be processed free of charge</p>
      <div className="bg-green-100 p-4 rounded-lg mb-4">
        <span className="text-green-700">No payment required</span>
      </div>
      <p className="text-sm text-muted-foreground">
        You will receive a confirmation email with the details of your exam.
      </p>
    </div>
  );
};
