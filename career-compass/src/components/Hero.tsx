type Props = {
  title: string;
  subtitle?: string;
  bgClassName?: string;
  children?: React.ReactNode;
};

export default function Hero({ title, subtitle, bgClassName = "bg-gray-100", children }: Props) {
  return (
    <section className={`${bgClassName} py-10`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}