import React from 'react';
import { useParams } from 'react-router-dom';
import { PaperClipIcon, PaperAirplaneIcon, TicketIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../components/ui/StatusBadge';


const TicketDetailPage = () => {
    const { id } = useParams();

    const ticketData = {
        title: 'Order not delivered',
        id: `TKT-${id}`,
        created: '01/11/2023',
        status: 'Open',
        priority: 'High',
        lastUpdated: '02/11/2023',
        assignedTo: 'Alex Johnson',
        createdBy: 'John Doe',
        messages: [
            {
                author: 'John Doe',
                time: '11:30',
                content: "I placed an order 5 days ago and it still hasn't arrived. The tracking number doesn't show any updates for the last 3 days.",
                attachment: 'order_receipt.pdf',
                isAgent: false,
            },
            {
                author: 'Alex Johnson',
                time: '14:05',
                content: "Hello John, I've looked into your order. It seems there was a delay at the warehouse. I've escalated the issue and it should be shipped by tomorrow. I'll keep you updated.",
                attachment: null,
                isAgent: true,
            }
        ]
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800">{ticketData.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{ticketData.id} • Created on {ticketData.created}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md flex-grow space-y-6">
                    {ticketData.messages.map((msg, index) => (
                        <div key={index} className={`flex gap-4 ${msg.isAgent ? 'justify-end' : ''}`}>
                            {!msg.isAgent && (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                                    {msg.author.charAt(0)}
                                </div>
                            )}
                            <div className={`w-full max-w-lg p-4 rounded-lg ${msg.isAgent ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                                <div className={`flex items-baseline space-x-2 ${msg.isAgent ? 'justify-end' : ''}`}>
                                    <p className="font-bold">{msg.author}</p>
                                    <p className={`text-xs ${msg.isAgent ? 'text-blue-200' : 'text-gray-500'}`}>{msg.time}</p>
                                </div>
                                <p className="mt-1">{msg.content}</p>
                                {msg.attachment && (
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${msg.isAgent ? 'bg-blue-400 border-blue-300' : 'bg-gray-200 border-gray-300'}`}>
                                            <PaperClipIcon className={`h-4 w-4 mr-2 ${msg.isAgent ? 'text-blue-100' : 'text-gray-500'}`} />
                                            {msg.attachment}
                                        </span>
                                    </div>
                                )}
                            </div>
                             {msg.isAgent && (
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center font-bold text-white">
                                    {msg.author.charAt(0)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <textarea className="w-full border-gray-200 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" rows="3" placeholder="Type your message here..."></textarea>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                        <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                            <PaperClipIcon className="h-6 w-6" />
                        </button>
                        <button className="bg-orange-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-600 flex items-center">
                            Send Reply
                            <PaperAirplaneIcon className="h-5 w-5 ml-2 -rotate-45" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-bold text-gray-800 text-lg">Ticket Information</h3>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="flex justify-between items-center mt-1">
                            <StatusBadge type="status" value={ticketData.status} />
                            <button className="text-sm text-blue-500 font-semibold hover:underline">Change</button>
                        </div>
                    </div>
                    <div className="mt-4 border-t pt-4 space-y-3 text-sm">
                        <div className="flex items-center"><TicketIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">ID:</span><span className="font-semibold text-gray-800 ml-2">{ticketData.id}</span></div>
                        <div className="flex items-center"><StarIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">Priority:</span><span className="font-semibold text-red-500 ml-2">{ticketData.priority}</span></div>
                        <div className="flex items-center"><ClockIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">Last Updated:</span><span className="font-semibold text-gray-800 ml-2">{ticketData.lastUpdated}</span></div>
                    </div>
                     <div className="mt-4 border-t pt-4">
                        <p className="text-sm text-gray-500">Assigned to</p>
                        <div className="flex justify-between items-center mt-1">
                            <span className="font-semibold text-gray-800">{ticketData.assignedTo}</span>
                            <button className="text-sm text-blue-500 font-semibold hover:underline">Assign</button>
                        </div>
                    </div>
                     <div className="mt-4 border-t pt-4">
                        <p className="text-sm text-gray-500">Created by</p>
                        <div className="flex items-center mt-2">
                             <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">J</div>
                             <div className="ml-3">
                                <p className="font-semibold text-gray-800">{ticketData.createdBy}</p>
                                <p className="text-xs text-gray-500">Created on {ticketData.created}</p>
                             </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <button className="w-full bg-white text-gray-800 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-50">Close Ticket</button>
                    <button className="w-full bg-white text-gray-800 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-50">Print Ticket</button>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailPage;


