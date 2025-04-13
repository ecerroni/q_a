import { ReactNode, useState, FC } from 'react';
import { useQueryTracker } from '@/hooks';
import { SearchInputText } from '@/components/filters';
import NoResults from '@/components/NoResults';
import { NavigationItem, QA } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import PopupModal from '@/components/modals/PopupModal';
import { useMutation } from '@apollo/client';
import { WalletIcon } from '@heroicons/react/24/outline';
import {
  ADD_QA_MUTATION,
  DELETE_QA_BY_ID_MUTATION,
  LIST_OWN_QA_QUERY,
  UPDATE_QA_MUTATION,
} from '@/api';
import QACard from '@/components/QACard';
import { toast } from 'react-toastify';

interface SpinnerWrapperProps {
  loading: boolean;
  padding?: 'small' | 'medium' | 'large';
  children?: ReactNode;
}

const SpinnerWrapper: FC<SpinnerWrapperProps> = ({
  loading,
  children,
  padding,
}) => {
  if (loading) {
    /* eslint-disable indent */
    let classy = 'w-full h-full flex justify-center items-center pt-0';
    switch (padding) {
      case 'small':
        classy = `w-full h-full flex justify-center items-center pt-10`;
        break;
      case 'medium':
        classy = 'w-full h-full flex justify-center items-center pt-20';
        break;
      case 'large':
        classy = 'w-full h-full flex justify-center items-center pt-30';
        break;
      default:
        break;
    }
    return (
      <span key={padding} className={`block ${classy}`}>
        <LoadingSpinner />
      </span>
    );
  }
  return <>{children}</>;
};

const navigation: NavigationItem[] = [
  {
    key: 'home',
    name: 'Home',
    to: '/p/dashboard',
    path: '/p/dashboard',
    icon: WalletIcon,
    current: true,
  },
];
// const defaultCurrentNavigationSelection: NavigationItemNames =
navigation.find(n => n.current)?.name ?? navigation?.[0].name ?? '';
const buildVariablesWithParams = (args: Record<string, any>) => {
  const variables = {
    params: {
      ...(args || {}),
    },
  };
  return variables;
};

const Home: FC = () => {
  // const { mutation: unsyncJob, loading: unsyncing } = UnsyncJob();

  const [searchTextValue, setSearchTextValue] = useState('');

  const [showQAModal, setShowQAModal] = useState(false);
  const [actionType, setActionType] = useState<
    'add' | 'remove' | 'update' | null
  >(null);
  const [selectedQA, setSelectedQA] = useState<QA | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { useTrackedTypedQuery } = useQueryTracker();
  const { data, loading: loadingQA } = useTrackedTypedQuery(LIST_OWN_QA_QUERY, {
    variables: buildVariablesWithParams({
      sort: 'created_at:desc',
      where: {
        answer_contains: searchTextValue,
      },
    }),
  });
  const { useRefetchTrackedQueries } = useQueryTracker();
  const refetchQueries = useRefetchTrackedQueries([LIST_OWN_QA_QUERY]);
  const [addQA, { loading: isAddingQA }] = useMutation(ADD_QA_MUTATION);

  const [updateQA, { loading: isUpdatingQA }] = useMutation(UPDATE_QA_MUTATION);
  const [deleteQA, { loading: isRemovingQA }] = useMutation(
    DELETE_QA_BY_ID_MUTATION
  );
  const addQuestionAnswer = ({
    question,
    answer,
  }: {
    question: string;
    answer: string;
  }) => {
    return new Promise((resolve, reject) => {
      if (isAddingQA) resolve(null);
      if (question?.length && answer?.length)
        addQA({
          variables: {
            input: {
              question,
              answer,
            },
          },
          refetchQueries,
        })
          .then(() => {
            toast.success('New QA Added');
            resolve(true);
          })
          .catch(() => {
            setErrorMessage('This question already exists!');
            reject(false);
          });
    });
  };

  const updateQuestionAnswer = ({
    question,
    answer,
    _id,
  }: {
    _id: string;
    question: string;
    answer: string;
  }) => {
    return new Promise((resolve, reject) => {
      if (isUpdatingQA) resolve(null);
      if (_id && question?.length && answer?.length)
        updateQA({
          variables: {
            input: {
              _id,
              question,
              answer,
            },
          },
          refetchQueries,
        })
          .then(() => {
            toast.success('QA Updated');
            resolve(true);
          })
          .catch(() => {
            setErrorMessage('This question already exists!');
            reject(false);
          });
    });
  };

  const removeQuestionAnswer = (_id: string) => {
    return new Promise((resolve, reject) => {
      if (isUpdatingQA) resolve(null);
      if (_id)
        deleteQA({
          variables: {
            _id,
          },
          refetchQueries,
        })
          .then(() => {
            toast.success('QA Removed');
            resolve(true);
          })
          .catch(() => {
            reject(false);
          });
    });
  };

  const isLoading = loadingQA || isAddingQA || isUpdatingQA || isRemovingQA;
  const qaList = data?.listOwnQA ?? [];

  return (
    <>
      <div className="sticky top-0 z-40 bg-gray-900">
        {/* Sticky search header */}
        <div className="flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 px-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="flex flex-1">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <div className="relative w-full">
                <SearchInputText
                  placeholder="Search Text within Answers..."
                  fieldName="answer"
                  onAfterChange={(_, v) => {
                    if (typeof v === 'string') setSearchTextValue(v);
                  }}
                  render={({ id, name, type, placeholder, onChange }) => (
                    <input
                      id={id}
                      autoComplete="off"
                      name={name}
                      type={type}
                      onChange={onChange}
                      defaultValue={searchTextValue}
                      placeholder={placeholder}
                      className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm"
                    />
                  )}
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="m-6">
        <button
          className="text-slate-800 p-4 rounded-xl bg-secondary-400"
          onClick={() => {
            setActionType('add');
            setShowQAModal(true);
          }}
        >
          Add New Q&A
        </button>
      </div>
      <main className="">
        <SpinnerWrapper loading={isLoading} padding="medium">
          {!qaList?.length ? (
            <NoResults />
          ) : (
            <div className="">
              {qaList.map(qa => {
                const { _id, question = '', answer = '' } = qa || {};
                return (
                  <QACard
                    key={_id}
                    question={question ?? ''}
                    answer={answer ?? ''}
                    onDelete={() => {
                      setActionType('remove');
                      setSelectedQA({
                        _id,
                        question: question ?? '',
                        answer: answer ?? '',
                      });
                      setShowQAModal(true);
                    }}
                    onEdit={() => {
                      setActionType('update');
                      setShowQAModal(true);
                      setSelectedQA({
                        _id,
                        question: question ?? '',
                        answer: answer ?? '',
                      });
                    }}
                  />
                );
              })}
            </div>
          )}
        </SpinnerWrapper>
      </main>
      <PopupModal
        isOpen={showQAModal}
        setIsOpen={setShowQAModal}
        value={''}
        qa={selectedQA}
        type={actionType}
        onConfirm={async ({ question, answer }) => {
          if (actionType === 'add') {
            await addQuestionAnswer({ question, answer });
          }
          if (actionType === 'update' && selectedQA?._id) {
            await updateQuestionAnswer({ ...selectedQA, question, answer });
          }
          if (actionType === 'remove' && selectedQA?._id) {
            await removeQuestionAnswer(selectedQA._id);
          }
          setShowQAModal(false);
        }}
        isLoading={isLoading}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        onCancel={() => {
          setActionType(null);
          setSelectedQA(null);
        }}
      />
    </>
  );
};

export default Home;
