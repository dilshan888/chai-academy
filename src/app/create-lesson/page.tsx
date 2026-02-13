import LessonEditor from "@/components/features/LessonEditor";

export const metadata = {
    title: "Create Lesson | Chai Academy",
};

export default function CreateLessonPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <LessonEditor />
        </div>
    );
}
