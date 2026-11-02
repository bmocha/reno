#!/bin/sh
# The original file in the cdn had some bugs and was transpiled.
# The src files in git seem to work fine. Just combine all the modern js files without transpiling.

SRC=../../../tribute/src
DST=./tribute_mod.js


cat > ${DST} <<DONE
// tribute_mod.js : Copy of tribute.js
// MIT License
// Original: https://github.com/zurb/tribute/
DONE


cat ${SRC}/utils.js ${SRC}/TributeEvents.js ${SRC}/TributeMenuEvents.js ${SRC}/TributeRange.js ${SRC}/TributeSearch.js ${SRC}/Tribute.js | sed -E '/^(import|export default)/d' >> ${DST}

echo "export default Tribute;" >> tribute_mod.js
