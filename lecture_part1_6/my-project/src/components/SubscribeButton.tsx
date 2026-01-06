const SubscribeButton = ({ buttonText }: { buttonText: string }) => {
  return (
    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">
      {buttonText}
    </button>
  );
};

export default SubscribeButton;
