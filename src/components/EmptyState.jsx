import React from 'react';
import { EmptyIcon } from './Icons';

const EmptyState = ({ message, actionText, onActionClick }) => (
    <div className="text-center py-16 px-6 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700">
        <div className="mx-auto text-gray-500 mb-4"><EmptyIcon /></div>
        <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
        {actionText && onActionClick && <button onClick={onActionClick} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition-all duration-300">{actionText}</button>}
    </div>
);

export default EmptyState;