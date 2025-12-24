interface HeaderBarProps {
    title: string;
    children?: React.ReactNode;
}   
export function HeaderBar({ title, children }: HeaderBarProps) {
    return (
        <div className="flex justify-between items-center w-full border-b p-4">
            <h1 className="text-lg font-semibold">{title}</h1>
            {children && <div>{children}</div>}
        </div>
    );
}