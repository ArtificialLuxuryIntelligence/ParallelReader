import React, { useEffect, useState } from 'react';
import { languageDropdownOptions } from '../../../modules/dropdownOptions';

// parameter is an array of dependencies to trigger refresh [I just made this up- is it an antipattern?]
export default function useGetPageLangOptions(deps = []) {
  const [ddOptions, setddOptions] = useState(null);

  async function getOptions() {
    let options = await languageDropdownOptions();
    setddOptions(options);
  }

  //lang j
  useEffect(() => {
    getOptions();
  }, [...deps]);

  return ddOptions;
}
