type TweetSearchProps = {
  value: string;
  placeholder: string;
  disabled: boolean;
  icon: any;
  onSearch: any;
  onChange: any
};
export function TweetSearch({
  value,
  placeholder,
  disabled,
  onSearch,
  icon,
  onChange,
}: TweetSearchProps) {

  function handleKeyDown(event: any) {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSearch(value)
    }
  }
  return (
    <div className="relative border-b">
      <input
        type="text"
        className="w-full bg-gray-50 py-4 pl-16 pr-32 text-gray-700"
        placeholder={placeholder}
        value={value}
        onKeyDown={handleKeyDown}
        onChange={onChange}
      />
      <div
        className={`absolute inset-y-0 left-0 flex items-center justify-center pl-8 pr-2 ${
          value ? 'text-gray-700' : 'text-gray-400'
        }`}
      >
        {icon}
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-8">
        <button
          className={`rounded-full px-4 py-1  font-semibold ${
            !disabled
              ? 'bg-gray-300 text-gray-700 hover:bg-gray-400 hover:text-white'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
          disabled={disabled}
          onClick={onSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
}
