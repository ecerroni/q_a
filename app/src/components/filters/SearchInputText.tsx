import {
  FC,
  ChangeEventHandler,
  ReactNode,
  KeyboardEvent,
  useRef,
} from 'react';
import { debounce } from '@/utils';
import { OnAfterChangeFunction } from '@/types';

type SearchId = 'question' | 'answer';
type SearchModifier = 'contain' | 'match';
type TextSearchSensitity = 's' | 'ss';
type SearchInputTextData<
  T extends SearchId,
  U extends TextSearchSensitity = 's'
> = {
  id: `${T}_${SearchModifier}${U}`;
  name: `${T}_${SearchModifier}${U}`;
  label: string;
  placeholder: string;
  type: 'text';
  onChange: ChangeEventHandler<HTMLInputElement>;
};
interface SearchInputTextProps {
  render: (
    _data: SearchInputTextData<SearchId, TextSearchSensitity>
  ) => ReactNode;
  fieldName: SearchId;
  onAfterChange?: OnAfterChangeFunction;
  sensitivity?: TextSearchSensitity;
  isCustomFilter?: boolean;
  searchModifier?: SearchModifier;
  placeholder?: string;
}
const SearchInputText: FC<SearchInputTextProps> = ({
  render,
  fieldName,
  sensitivity = 's',
  onAfterChange = () => {
    //
  },
  isCustomFilter = false,
  searchModifier = 'contain',
  placeholder,
}: SearchInputTextProps) => {
  const selectRef = useRef();

  const handleChange = (event: KeyboardEvent<HTMLInputElement>) => {
    type CT = typeof event.currentTarget;
    const target: CT = event.target as CT;
    const value =
      target?.value === '' && target === selectRef.current
        ? undefined
        : target?.value;
    onAfterChange(target?.name, value, { isCustomFilter });
  };

  const debounceSearch = debounce(handleChange, 250);

  type U = typeof sensitivity;
  const fieldSearch: SearchInputTextData<SearchId, U> = {
    id: `${fieldName}_${searchModifier}${sensitivity}`,
    name: `${fieldName}_${searchModifier}${sensitivity}`,
    label: `${fieldName.toUpperCase()}`,
    placeholder: placeholder ?? `Search by ${fieldName}...`,
    type: 'text',
    onChange: debounceSearch,
  };
  return render(fieldSearch);
};

export default SearchInputText;
