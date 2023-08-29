/* Get DOM element */
// content div
const originalContentBorder = $('#content').css('border');
const originalContentWidth = $('#content').css('width');
const originalContentHeight = $('#content').css('height');
let content = $('#content');
// header div
const originalheaderDisplay = $('#header').css('display');
const originalheaderBorder = $('#header').css('border');
let header = $('#header');
// description text div
const originaldesctextDisplay = $('#description_text').css('display');
let desc_text = $('#description_text')
// pdb container div
const originalpdbContainerDisplay = $('#pdb-container').css('display');
const originalpdbContainerWidth = $('#pdb-container').css('width');
const originalpdbContainerHeight = $('#pdb-container').css('height');
let pdbContainer = $('#pdb-container');
// pdb div
let pdb = $('#pdb');
// infobox div
const originalinfoboxDisplay = $('.infobox').css('display');
let infobox = $('.infobox');
// infobox-text div
const originalinfoboxTextDisplay = $('.infobox-text').css('display');
let infoboxtext = $('.infobox-text');
// divider div
const originaldividerDisplay = $('.divider').css('display');
let divider = $('.divider');
// container-fluid div
const originalcontainerfluidDisplay = $('.container-fluid').css('display');
let containerfluid = $('.container-fluid');
// rowMenu div
const originalrowmenuDisplay = $('#rowMenu').css('display');
let rowmenu = $('#rowMenu');
// Style options div
let cartoon = $('#cartoon-link');
let sphere = $('#sphere-link');
let trace = $('#trace-link');
let line = $('#line-link');
let stick = $('#stick-link');
let amino = $('#aares');
// Initial pdb style
let isCartoonStyle = false;
let isSphereStyle = false;
let isTraceStyle = false;
let isLineStyle = false;
let isStickStyle = false;

// global clickable function
let isexpandIconClickable = true;
let isMaximized = false;
let isminimizeIconClickable = true;
let isMinimized = false;

// Main show-button to call all function
$(document).ready(function() {
    $('#show-button').on('click', function() {
        const genesName = $('#genesName').val().trim();

        if (genesName === '') {
            alert("Please enter a genes name first.\nExample: 2fej / 2yul")
            return; // Stop further execution if genes yet to be inserted
        }
        content.css({
            "left": "10px",
            "top": "100px",
        })
        pdbOriginal();
        restoreOriginalStyle();
        content.toggle();
    });
    draggableHeader();
    maximizeButton();
    minimizeButton();
    closeButton();
    tooltipTextHover();
});

/* store original styles in function */
function restoreOriginalStyle() {
    content.css({
        'width': originalContentWidth,
        'height': originalContentHeight,
        'border': originalContentBorder,
    })
    header.css({
        'display': originalheaderDisplay,
        'border': originalheaderBorder,
    })
    desc_text.css({
        'display': originaldesctextDisplay,
    })
    pdbContainer.css({
        'display': originalpdbContainerDisplay,
        'width': originalpdbContainerWidth,
        'height': originalpdbContainerHeight,
    })
    pdb.css({
        'visibility': 'visible',
    })
    infobox.css({
        'display': originalinfoboxDisplay,
    })
    infoboxtext.css({
        'display': originalinfoboxTextDisplay,
    })
    divider.css({
        'display': originaldividerDisplay,
    })
    containerfluid.css({
        'display': originalcontainerfluidDisplay,
    })
    rowmenu.css({
        'display': originalrowmenuDisplay,
    })
}

// set style and color function //
let viewer;
function pdbStyle(isCartoonStyle, isSphereStyle, isTraceStyle, isLineStyle, isStickStyle, isAmino) {
    let styles = {};
    let ss = {};
    
    if (isCartoonStyle) {
        if (isAmino) {
            styles = { chain: "A", cartoon: { colorscheme: 'amino' } }
        } else {styles = { chain: "A", cartoon: { color: 'spectrum' } }}
    } else if (isSphereStyle) {
        if (isAmino) {
            styles = { chain: "A", sphere: { colorscheme: 'amino' } }
        } else { styles = { chain: "A", sphere: { color: 'spectrum' } }}
    } else if (isTraceStyle) {
        if (isAmino) {
            styles = { chain: "A", cartoon: { style: 'trace', colorscheme: 'amino' } }
        } else {styles = { chain: "A", cartoon: { style: 'trace', color: 'spectrum' } }}
    } else if (isLineStyle) {
        if (isAmino) {
            styles = { chain: "A", line: { colorscheme: 'amino' } }
        } else {styles = { chain: "A", line: { color: 'spectrum' } }}
    } else if (isStickStyle) {
        if (isAmino) {
            styles = { chain: "A", stick: { colorscheme: 'amino' } }
        } else {styles = { chain: "A", stick: { color: 'spectrum' } }}
    }

    viewer.setStyle(ss, styles);
    viewer.zoomTo();
    viewer.render();
    viewer.zoom(1.2, 0);
}

// apply the style and color function on click //
cartoon.on('click', function() {
    isCartoonStyle = true;
    isSphereStyle = isTraceStyle = isLineStyle = isStickStyle = false;
    pdbStyle(true, false, false, false, false, false);
    updateSelectedStyle("Cartoon");
})
sphere.on('click', function() {
    isSphereStyle = true;
    isCartoonStyle = isTraceStyle = isLineStyle = isStickStyle = false;
    pdbStyle(false, true, false, false, false, false);
    updateSelectedStyle("Sphere");
})
trace.on('click', function() {
    isTraceStyle = true;
    isSphereStyle = isCartoonStyle = isLineStyle = isStickStyle = false;
    pdbStyle(false, false, true, false, false, false);
    updateSelectedStyle("Trace");
})
line.on('click', function() {
    isLineStyle = true;
    isSphereStyle = isTraceStyle = isCartoonStyle = isStickStyle = false;
    pdbStyle(false, false, false, true, false, false);
    updateSelectedStyle("Line");
})
stick.on('click', function() {
    isStickStyle = true;
    isSphereStyle = isTraceStyle = isLineStyle = isCartoonStyle = false;
    pdbStyle(false, false, false, false, true, false);
    updateSelectedStyle("Stick");
})
amino.on('click', function() {
    if (isCartoonStyle) {
        pdbStyle(true, false, false, false, false, true);
    } else if (isSphereStyle) {
        pdbStyle(false, true, false, false, false, true);
    } else if (isTraceStyle) {
        pdbStyle(false, false, true, false, false, true);
    } else if (isLineStyle) {
        pdbStyle(false, false, false, true, false, true);
    } else if (isStickStyle) {
        pdbStyle(false, false, false, false, true, true);
    }
    updateSelectedColor("Amino residue");
})

// update the selected style text
function updateSelectedStyle(styleText) {
    $('#selected-style').text(styleText); // Update the selected style text
    $('#selected-color').text('Default'); // Return the selected color text back to default
}
// update the selected color text
function updateSelectedColor(colorText) {
    $('#selected-color').text(colorText); // Update the selected color text
}


let genesType = "";
// pdb function
function pdbOriginal() {
    const genesName = $('#genesName').val();
    genesType = genesName;

    let element = pdb;
    let config = {};
    viewer = $3Dmol.createViewer( element, config );
    let pdbUrl = 'https://files.rcsb.org/view/'+ genesType +'.pdb';
    let v = viewer;

    function viewerFunction() {;
        v.zoomTo();                                      /* set camera */
        v.render();                                      /* render scene */
        v.zoom(1.2, 1000);                               /* slight zoom */
    }

    jQuery.ajax( pdbUrl, { 
        success: function(data) {
            v.addModel( data, "pdb" )
            pdbStyle(true, false, false, false, false, false); // Style and color will be applied then loaded here, cartoon as initial style
            viewerFunction();
        },
        error: function(hdr, status, err) {
            console.error( "Failed to load PDB " + pdbUrl + ": " + err );
        },
    });
}

// Draggable header function
function draggableHeader() {
    content.draggable({ // .draggable function can be used by jquery-ui (Library Dependend)
        handle : header  // Header as handle for drag function
    });
    $("div, p").disableSelection(); // Apply draggable function to header only while the rest of content follows
};

// Maximize button function
function maximizeButton() {
    const expandIcon = $('.fa-expand');

    isexpandIconClickable = true;
    isMaximized = false;

    expandIcon.on('click', function() {
        if (isMinimized) {
            // If isMinimized is true, prevent clicking by returning early
            return;
        }

        isMaximized = !isMaximized;

        if (!isexpandIconClickable) {
            return;
        }

        if (isMaximized) {
            // Maximize the window by adjusting the height, width, and visibility of content and pdbContainer
            content.css({
                'width': '780px',
                'height': '960px',
            });
            desc_text.css({
                "width": 'relative',
                "height": 'relative',
            })
            pdbContainer.css({
                "width": '750px',
                "height": '700px',
            })
            pdb.css({
                "width": 'relative',
                "height": 'relative',
            })
            divider.css({
                "width": 'relative',
            })
        } else // Restore window size
        {
            restoreOriginalStyle();
        }
    });
};

// Minimize button function
function minimizeButton() {
    const minimizeIcon = $(".fa-minus-circle");

    isminimizeIconClickable = true;
    isMinimized = false;

    minimizeIcon.on("click", function(){
        if (isMaximized) {
            // If isMaximized is true, prevent clicking by returning early
            return;
        }

        isMinimized = !isMinimized;

        if (!isminimizeIconClickable){
            return;
        }
        
        if (isMinimized) { // minimize window
            header.css({
                border: '1px solid #000',
            })
            content.css({
                'border': 'none',
            })
            pdb.css({
                'visibility': 'hidden',
            })
            desc_text
            .add(pdbContainer)
            .add(infobox)
            .add(infoboxtext)
            .add(divider)
            .add(containerfluid)
            .add(rowmenu)
            .css({
                'display': 'none',
            });
        }
        else // restore window size
        {
            restoreOriginalStyle();
        }
    });
};

// Close window function
function closeButton() {
    const closeIcon = $(".fa-times-circle");
    
    closeIcon.on('click', function () {
        content.css({
            "display": "none"
        });
        isMaximized = false; // flag so next time window is reopened, its not on maximized state
        isMinimized = false; // flag so next time window is reopened, its not on minimized state
    });
}

// Tooltiptext window function
function tooltipTextHover() {
    const infoIcon = $('#tooltip');
    const tooltipText = $('#tooltipText');

    // tooltipText can be dragged
    tooltipText.draggable({ // draggable function require jquery ui (library dependant)
        containment: 'window',
        start: function() {
            draggingTooltip = true;
        },
        stop: function() {
            draggingTooltip = false;
        }
    });

    let draggingTooltip = false;

    infoIcon.mouseover(function() {
        // Show tooltip when hovered over infoIcon
        tooltipText.css({
            visibility: 'visible',
            opacity: 1,
        });

        const iconRect = infoIcon[0].getBoundingClientRect();

        // Calculate tooltip position based on icon position
        const tooltipX = iconRect.right + 10;
        const tooltipY = iconRect.top + iconRect.height / 2 - tooltipText.outerHeight() / 2;

        // Calculate maximum allowed positions to stay within window screen boundaries
        const maxX = window.innerWidth - tooltipText.outerWidth() - 10; // Subtract some padding
        const maxY = window.innerHeight - tooltipText.outerHeight();

        // Adjust tooltip position to stay within boundaries
        const adjustedTooltipX = Math.max(10, Math.min(maxX, tooltipX)); // Keep some minimum distance from left
        const adjustedTooltipY = Math.min(maxY, tooltipY);

        // Set tooltip position
        tooltipText.css({
            left: `${adjustedTooltipX}px`,
            top: `${adjustedTooltipY}px`,
        });
    });

    infoIcon.mouseout(function() {
        // Hide tooltip when not hovered over infoIcon
        tooltipText.css({
            visibility: 'hidden',
            opacity: 0,
        });
    });
}
