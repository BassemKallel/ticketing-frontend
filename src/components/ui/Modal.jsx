import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react';

const Modal = ({ isOpen, onClose, title, children }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-40" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 backdrop-blur-xs" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-lg transition-all hover:shadow-xl">
                                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                                    {title}
                                    <button
                                        onClick={onClose}
                                        className="p-1 rounded-full hover:bg-[#FFE4B5] transition-colors duration-300"
                                    >
                                        <XMarkIcon className="h-6 w-6 text-[#F28C38]" />
                                    </button>
                                </DialogTitle>
                                <div className="mt-4">
                                    {children}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default Modal;