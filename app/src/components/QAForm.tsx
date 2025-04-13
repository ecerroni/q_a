import { useEffect, useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { Textarea } from '@headlessui/react';
import { QA } from '@/types';
import { useMutation } from '@apollo/client';
import { SUGGEST_AI_ANSWER_MUTATION } from '@/api';
import { toast } from 'react-toastify';

interface QAFormProps {
  // eslint-disable-next-line no-unused-vars
  action?: 'add' | 'remove' | 'update';
  onConfirm?: (_: any) => void;
  onCancel?: (_v?: any) => void;
  errorMessage?: string | null;
  cleanError?: (_?: any) => void;
  isLoading?: boolean;
  qa?: QA;
}

const textMinLength = 36;

const QAForm: React.FC<QAFormProps> = ({
  action = 'add',
  onConfirm,
  onCancel,
  errorMessage,
  cleanError,
  isLoading,
  qa,
}: QAFormProps) => {
  const [helperMessage, setHelperMessage] = useState({
    question: '',
    answer: qa?.answer?.length
      ? ''
      : `Your answer should at least ${textMinLength} characters long`,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    clearErrors,
    watch,
  } = useForm();

  const [suggestAI, { loading: isSuggesting }] = useMutation(
    SUGGEST_AI_ANSWER_MUTATION
  );

  const currentQuestion = watch('question');

  useEffect(() => {
    if (qa?._id) {
      const { question, answer } = qa;
      setValue('question', question, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('answer', answer, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [qa]);

  const suggestAiAnswer = async (question: string) => {
    return new Promise((resolve, reject) => {
      suggestAI({
        variables: {
          question,
        },
      })
        .then(response => {
          const { data } = response ?? {};
          if (data?.suggestAiAnswer?.length) {
            toast.success('New AI Answer');
            const { suggestAiAnswer: answer } = data;
            setValue('answer', answer, {
              shouldValidate: true,
              shouldDirty: true,
            });
            if (answer.length > textMinLength) {
              clearErrors('answer');
              setHelperMessage({
                ...helperMessage,
                answer: '',
              });
            }
          } else toast.error('Could not complete your request');

          resolve(true);
        })
        .catch(() => {
          toast.error('Oops! Something went wrong');
          reject(false);
        });
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = data => {
    // do something
    onConfirm?.(data);
  };
  return (
    <>
      <div className="flex w-full flex-1 flex-col justify-center items-center py-8 px-6 bg-transparent rounded-md lg:px-8">
        <div className="mt-10 sm:mx-auto w-full max-w-md">
          <div className="w-full max-w-xl">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-slate-100 shadow-md rounded px-8 pt-6 pb-8 mb-4"
            >
              <div className="mb-4">
                <div className="w-full flex justify-between">
                  <label
                    className="block text-gray-900 text-sm font-bold mb-2"
                    htmlFor="question"
                  >
                    Question
                  </label>
                  <button
                    className={`text-xs underline cursor-pointer ${
                      !currentQuestion || currentQuestion?.length < 10
                        ? 'text-slate-200'
                        : ''
                    }`}
                    disabled={!currentQuestion}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      suggestAiAnswer(currentQuestion);
                    }}
                  >
                    {isSuggesting ? 'Answering...' : 'Suggest AI answer'}
                  </button>
                </div>
                <Textarea
                  id="question"
                  rows={2}
                  defaultValue={qa?.question ?? ''}
                  disabled={isSuggesting}
                  className="shadow appearance-none border rounded w-full py-2 px-3 mb-2 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                  {...register('question', {
                    required: true,
                    onChange() {
                      if (errorMessage) cleanError?.();
                    },
                  })}
                />

                <p className="text-red-500 text-xs italic h-2">
                  {errors.question && 'Please enter a question.'}
                  {errorMessage}
                </p>
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-900 text-sm font-bold mb-2"
                  htmlFor="answer"
                >
                  Answer
                </label>
                <Textarea
                  id="answer"
                  disabled={isSuggesting}
                  rows={10}
                  defaultValue={qa?.answer ?? ''}
                  className={`shadow appearance-none border ${
                    errors.answer ? 'border-red-500' : ''
                  } rounded w-full py-2 px-3 text-gray-900 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                  {...register('answer', {
                    required: true,
                    minLength: textMinLength,
                    onChange(event) {
                      const text = event.target.value;
                      if (text?.length < 1) {
                        setHelperMessage({
                          ...helperMessage,
                          answer: `Your answer should at least ${textMinLength} characters long`,
                        });
                      } else if (
                        text?.length > 1 &&
                        text?.length < textMinLength
                      ) {
                        setHelperMessage({
                          ...helperMessage,
                          answer: ` - ${
                            textMinLength - text.length
                          } characters left`,
                        });
                      } else if (
                        helperMessage.answer.length &&
                        text?.length >= textMinLength
                      ) {
                        setHelperMessage({
                          ...helperMessage,
                          answer: '',
                        });
                      }
                    },
                  })}
                />
                <p className="text-red-500 text-xs italic h-2">
                  {helperMessage?.answer?.length ? (
                    <span>{helperMessage.answer}</span>
                  ) : (
                    errors.answer && 'Please add an answer.'
                  )}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <button
                  className={`${
                    !isValid || isLoading || errorMessage
                      ? 'disable bg-gray-200 pointer-events-none'
                      : 'bg-primary-500 hover:bg-primary-700'
                  } mr-2 relative w-full  text-white text-xs py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                  type="submit"
                  onClick={() => handleSubmit(onSubmit)}
                >
                  {isLoading ? (
                    <>
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="absolute inline left-32 top-3 mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        ></path>
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="#404040"
                        ></path>
                      </svg>
                    </>
                  ) : null}
                  {action?.toUpperCase()} Q&A
                </button>
                <button
                  className={`bg-red-400 hover:bg-red-700 relative w-full  text-white text-xs py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                  onClick={() => {
                    cleanError?.();
                    onCancel?.();
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default QAForm;
