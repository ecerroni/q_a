import {} from '@heroicons/react/20/solid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface QACardProps {
  question: string;
  answer: string;
  onEdit?: (_: any) => void;
  onDelete?: (_: any) => void;
}

const QACard: React.FC<QACardProps> = ({
  question,
  answer,
  onEdit,
  onDelete,
}: QACardProps) => {
  return (
    <div className="bg-slate-100 px-4 py-5 sm:px-6 m-3 max-w-3xl rounded-lg">
      <div className="flex space-x-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{question}</p>
        </div>
        <div className="flex justify-between">
          <PencilSquareIcon
            className="cursor-pointer w-5 mr-2"
            onClick={onEdit}
          />
          <TrashIcon
            className="cursor-pointer w-5 text-red-500"
            onClick={onDelete}
          />
        </div>
      </div>
      <p className="text-xs text-slate-700 overflow-ellipsis">{answer}</p>
    </div>
  );
};

export default QACard;
