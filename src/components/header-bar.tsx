interface HeaderBarProps {
    title: string;
    description?:string;
    children?: React.ReactNode;
}   
export function HeaderBar({ title,description, children }: HeaderBarProps) {
    return (
        <div className="flex justify-between items-center w-full border-b p-4">
            <div>
                <h1  className="text-lg font-semibold">{title}</h1>
                <span className="text-sm">{description}</span>
            </div>
            {children && <div>{children}</div>}
        </div>
    );
}