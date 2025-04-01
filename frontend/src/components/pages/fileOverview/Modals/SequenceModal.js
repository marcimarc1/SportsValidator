import React, { useState } from "react";
import Modal from "react-modal";
import { DndContext, closestCenter, useDraggable, useDroppable } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";

Modal.setAppElement("#root");

const SequenceModal = ({ videoTitles, newTitle, onEditSequence }) => {
    const [items, setItems] = useState([newTitle, ...videoTitles]);
    const [openSequenceModal, setOpenSequenceModal] = React.useState(false);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        if (oldIndex === 0) {
            setItems(arrayMove(items, oldIndex, newIndex));
        }
    };

    const handleOpen = (event) => {
        setOpenSequenceModal(true);
    }

    const handleClose = () => {
        const videoIndex = items.indexOf(newTitle);
        onEditSequence(videoIndex);
        setOpenSequenceModal(false);
    };

    return (
        <div className="mt-3 mb-3">
            <button className="FileButton" onClick={handleOpen}>Edit</button>
            <Modal isOpen={openSequenceModal} onRequestClose={handleClose} className="modal" overlayClassName="overlay">
                <h2 className="text-xl font-bold mb-4">Reorder List</h2>
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items}>
                        {items.map((item, index) => (
                            <DraggableItem key={item} id={item} text={item} isDraggable={index === 0} />
                        ))}
                    </SortableContext>
                </DndContext>
                <button onClick={handleClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Close</button>
            </Modal>
        </div>
    );
};

const DraggableItem = ({ id, text, isDraggable }) => {
    const { attributes, listeners, setNodeRef, transform } = useSortable({ id, disabled: !isDraggable });

    return (
        <div
            ref={setNodeRef}
            {...(isDraggable ? { ...attributes, ...listeners } : {})}
            className={`p-2 border mb-2 ${isDraggable ? "bg-blue-200 cursor-grab" : "bg-gray-200"}`}
            style={{ transform: transform ? `translateY(${transform.y}px)` : undefined }}
        >
            {text}
        </div>
    );
};

export default SequenceModal;