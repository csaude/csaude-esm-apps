import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';

interface NavigationLinkProps {
  name: string;
  title: string;
  className?: string;
}

const NavigationLink = ({ name, title, className }: NavigationLinkProps) => {
  const updatePath = (newSegment: string) => {
    const urlSegments = window.location.pathname.split('/');
    urlSegments[urlSegments.length - 1] = newSegment;
    return urlSegments.join('/');
  };

  const updatedUrl = updatePath(name);
  return (
    <ConfigurableLink to={updatedUrl} className={className}>
      {title}
    </ConfigurableLink>
  );
};

export default NavigationLink;
