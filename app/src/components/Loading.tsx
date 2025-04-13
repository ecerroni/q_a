import { FC } from 'react';

interface LoadingProps {
  loadingMessage?: string;
}

const Loading: FC<LoadingProps> = ({ loadingMessage = '' }) => (
  <div className="spinnerWrapper">
    <div className="spinner" />
    <p
      style={{
        marginTop: -25,
        color: 'silver',
        fontSize: 12,
        textAlign: 'center',
        position: 'absolute',
        top: '50%',
        width: 200,
        left: 'calc(50% - 75px)',
      }}
    >
      {loadingMessage}
    </p>
  </div>
);

export default Loading;
