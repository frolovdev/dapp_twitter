import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';

type LinkProps = {
  activeClassName?: string;
} & NextLinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>;

export const Link = ({ activeClassName, ...props }: LinkProps) => {
  const { asPath } = useRouter();

  const className =
    asPath === props.href || asPath === props.as
      ? `${props.className} ${activeClassName}`.trim()
      : props.className;
  return <NextLink {...props} className={className}></NextLink>;
};
