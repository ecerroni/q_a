const HrSeparator = ({ text = '' }: { text: string }) => {
  return (
    <h1
      className="text-gray-400 text-center overflow-hidden before:h-[1px] after:h-[1px] after:bg-gray-400 
           after:inline-block after:relative after:align-middle after:w-1/4 
           before:bg-gray-400 before:inline-block before:relative before:align-middle 
           before:w-1/4 before:right-2 after:left-2 text-xl p-4"
    >
      {text}
    </h1>
  );
};

export default HrSeparator;
