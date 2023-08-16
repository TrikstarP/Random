// Get DOM elements
const content = document.getElementById('content');
const header = document.getElementById('header');
const exp = document.getElementById('exp');
const pdbContainer = document.getElementById('pdb-container');
const pdb = document.getElementById('pdb');
const showButton = document.getElementById('show-button');
const minusCircleIcon = document.querySelector('.fa.fa-minus-circle');
const infobox = document.querySelector('.infobox');
const divider = document.querySelector('.divider');
const tooltip = document.getElementById('tooltipText');
const trigger = document.getElementById('triggerTooltip');
const infoCircleIcon = document.querySelector('.fa.fa-info-circle');
const containerFluid = document.querySelector('.container-fluid');
const rowMenu = document.getElementById('rowMenu');

// Get original styles
const originalExpStyle = { ...exp.style };
const originalPdbContainerStyle = { ...pdbContainer.style };

// Store the original state of the content window
const originalContentState = {
    height: content.style.height,
    width: content.style.width,
    pdbContainerHeight: pdbContainer.style.height,
    expDisplay: exp.style.display,
    pdbContainerDisplay: pdbContainer.style.display,
    pdbVisibility: pdb.style.visibility,
    pdbContainerBorder: pdbContainer.style.border,
    rowMenuDisplay: rowMenu.style.display,
};

// Variables to track dragging and minimizing state
let isDragging = false;
let dragOffsetX, dragOffsetY;
let lastMouseMoveTime = 0; // Variable to track the time of the last mousemove event
const throttleInterval = 16; // Throttle interval in milliseconds (roughly 60 FPS)
let isMinimized = false; // Variable to keep track of the minimized state
let originalContentDisplay = "block";
let viewerInstance = null;
let viewerData = null;
let originalContentHeight = null; // Variable to store the original height of the content element
let originalContentWidth = null; // Variable to store the original width of the content element
let originalPdbContainerHeight = null; // Variable to store the original height of the pdb-container element
let isMinusIconClickable = true;
let isExpandIconClickable = true;
let selectedColorScheme = 'default'; // Default color scheme, change it based on your needs
let activeColorScheme = null;


// Event listener to start dragging the window when the header is clicked
header.addEventListener('mousedown', (event) => {
    isDragging = true;
    dragOffsetX = event.clientX - content.offsetLeft;
    dragOffsetY = event.clientY - content.offsetTop;
});

// Event listener to move the window while dragging
document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const currentTime = Date.now();
        if (currentTime - lastMouseMoveTime > throttleInterval) {
            lastMouseMoveTime = currentTime;
            requestAnimationFrame(() => {
                content.style.left = `${event.clientX - dragOffsetX}px`;
                content.style.top = `${event.clientY - dragOffsetY}px`;

                // Update tooltip position based on the window position
                const tooltipX = event.clientX; // Horizontal position with spacing
                const tooltipY = event.clientY;

                // Ensure tooltip stays within window boundaries
                const maxX = window.innerWidth - tooltip.offsetWidth;
                const maxY = window.innerHeight - tooltip.offsetHeight;

                tooltip.style.left = `${Math.min(maxX, tooltipX)}px`;
                tooltip.style.top = `${Math.min(maxY, tooltipY)}px`;
            });
        }
    }
});

infoCircleIcon.addEventListener('mouseover', (event) => {
    const iconRect = infoCircleIcon.getBoundingClientRect();
    
    // Calculate the position for the tooltip relative to the icon
    const tooltipX = iconRect.right + 10; // Adjust as needed
    const tooltipY = iconRect.top + iconRect.height / 2 - tooltip.offsetHeight / 2;

    // Ensure tooltip stays within window boundaries
    const maxX = window.innerWidth - tooltip.offsetWidth;
    const maxY = window.innerHeight - tooltip.offsetHeight;

    tooltip.style.left = `${Math.min(maxX, tooltipX)}px`;
    tooltip.style.top = `${Math.min(maxY, tooltipY)}px`;
});

// Event listener to stop dragging when the mouse button is released
document.addEventListener('mouseup', () => {
    isDragging = false;
});

function toggleClass(element, className) {
    element.classList.toggle(className);
}

// Event listener to handle the click on the expand icon
document.getElementById('expand-icon').addEventListener('click', function () {
    if (!isExpandIconClickable) { // Check if the expand-icon is clickable
        return; // Ignore the click event when the icon is not clickable (window is minimized)
    }
    if (!isMinimized) {
        // Maximize the window by adjusting the height, width, and visibility of content and pdbContainer
        content.style.height = "960px";
        content.style.width = "780px";
        pdbContainer.style.height = "700px";
        exp.style.display = "block";
        pdb.style.display = "block";
        pdbContainer.style.border = "1px solid #ddd";
        divider.style.width = "relative"

        // Disable the fa-minus-circle icon while the window is maximized
        isMinusIconClickable = false;
        minusCircleIcon.setAttribute("tabindex", "-1"); // Prevent keyboard focus
    } else {
        // Minimize the window by restoring the original height, width, and visibility of content and pdbContainer
        content.style.height = "610px";
        content.style.width = "480px";
        pdbContainer.style.height = "350px";
        exp.style.display = "block";
        pdb.style.display = "block";
        pdbContainer.style.border = "1px solid #ddd";
        divider.style.width = "relative"

        // Enable the fa-minus-circle icon again when the window is in its original state
        isMinusIconClickable = true;
        minusCircleIcon.removeAttribute("tabindex"); // Enable keyboard focus
    }
    // Toggle the minimized state
    isMinimized = !isMinimized;
    content.classList.toggle('expanded');
    pdbContainer.classList.toggle('expanded');
});

// Event listener for minusCircleIcon click
minusCircleIcon.addEventListener('click', function () {
    if (!isMinusIconClickable) {
        return; // Ignore the click event when the icon is not clickable (window is maximized)
    }

    if (isMinimized) {
        // Restore the window to its original state
        content.style.height = originalContentState.height;
        content.style.width = originalContentState.width;
        pdbContainer.style.height = originalContentState.pdbContainerHeight;
        exp.style.display = originalContentState.expDisplay;
        pdbContainer.style.display = originalContentState.pdbContainerDisplay;
        pdb.style.visibility = originalContentState.pdbVisibility;
        pdbContainer.style.border = originalContentState.pdbContainerBorder;
        infobox.style.display = "block";
        divider.style.display = "block";
        containerFluid.style.display = "block";
        rowMenu.style.display = originalContentState.rowMenuDisplay;

        // Recreate the 3Dmol.js viewer and load the data
        if (viewerInstance && viewerData) {
            viewerInstance.addModel(viewerData, "pdb");
            viewerInstance.setStyle({chain: "A"}, { cartoon: { color: 'spectrum' } });
            viewerInstance.zoomTo();
            viewerInstance.render();
            viewerInstance.zoom(1.2, 1000);
        }
    } else {
        // Minimize the window by adjusting the height, width, and visibility of content and pdbContainer
        content.style.height = header.clientHeight + "px";
        content.style.width = "480px";
        pdbContainer.style.height = "40px";
        pdb.style.visibility = "hidden";
        exp.style.display = "none";
        pdbContainer.style.display = "none";
        pdbContainer.style.border = "none";
        infobox.style.display = "none";
        divider.style.display = "none";
        containerFluid.style.display = "none";
        rowMenu.style.display = "none";

        // Save the 3Dmol.js viewer data and remove the content from the pdb element
        if (viewerInstance) {
            viewerData = viewerInstance.getData();
            viewerInstance.removeAllModels();
        }
    }
    isMinimized = !isMinimized;
    minusCircleIcon.classList.toggle('disabled', isMinimized);
    isExpandIconClickable = !isMinimized;
});

// Function to handle the minusCircleIcon click
function handleMinusCircleClick() {
    // Check if the window is expanded (maximized) and return if it is
    if (!isMinimized) {
        return; // Ignore the click event when the window is maximized
    }
}

// Remove the click event listener for minusCircleIcon
minusCircleIcon.removeEventListener('click', handleMinusCircleClick);

// Function to show the content window
function showContent() {
    content.style.display = originalContentDisplay; // Show the content when the button is clicked
    content.style.height = originalContentHeight || "610px"; // Restore the original height
    content.style.width = originalContentWidth || "480px"; // Restore the original width
    pdbContainer.style.height = originalPdbContainerHeight || "350px"; // Restore the original pdbContainer height

    // Enable the fa-minus-circle icon when the window is in its original state
    minusCircleIcon.classList.remove('disabled');
}

function resetToOriginalState() {
    // Restore the original styles and state
    content.style.height = originalContentState.height;
    content.style.width = originalContentState.width;
    pdbContainer.style.height = originalContentState.pdbContainerHeight;
    exp.style.display = originalContentState.expDisplay;
    pdbContainer.style.display = originalContentState.pdbContainerDisplay;
    pdb.style.visibility = originalContentState.pdbVisibility;
    pdbContainer.style.border = originalContentState.pdbContainerBorder;
    rowMenu.style.display = originalContentState.rowMenuDisplay;

    // Remove the current viewer instance and recreate it
    if (viewerInstance) {
        viewerInstance.destroy(); // Destroy the current viewer instance
        viewerInstance = null; // Clear the viewer instance reference
    }

    // Reset flags and clickability (same as before)
    isMinimized = false;
    isMinusIconClickable = true;
    isExpandIconClickable = true;

    // Remove expanded classes (same as before)
    content.classList.remove('expanded');
    pdbContainer.classList.remove('expanded');

    // Enable minusCircleIcon (same as before)
    minusCircleIcon.classList.remove('disabled');
    minusCircleIcon.addEventListener('click', handleMinusCircleClick);

    // Enable expand-icon (same as before)
    document.getElementById('expand-icon').addEventListener('click', handleExpandIconClick);

    // Clear the stored current state
    originalContentDisplay = "";
    originalContentHeight = "";
    originalContentWidth = "";
    originalPdbContainerHeight = "";

    viewerInstance = $3Dmol.createViewer(pdb); // Re-create the viewer instance
}

let viewer;
let isCartoonStyle = true; // Flag to track the current style

function load3DStructure() {
    // Define element and config variables
    let element = document.getElementById('pdb'); // or $("#pdb")[0];
    let config = {};
    let pdbUrl = 'https://files.rcsb.org/view/2FEJ.pdb';
    viewer = $3Dmol.createViewer(element, config);
    
    jQuery.ajax({
        url: pdbUrl,
        success: function (data) {
            viewer.addModel(data, "pdb"); // Load data
            loadAndStylePDBData(isCartoonStyle, false, false, false); // Apply the initial style
            viewer.zoom(1.2, 1000); // Slight zoom
        },
        error: function (hdr, status, err) {
            console.error("Failed to load PDB " + pdbUrl + ": " + err);
        },
    });
}

// Function to load and style PDB data
function loadAndStylePDBData(isCartoon, isTrace, isLine, isStick, colorScheme) {
    let style = {};

    if (isCartoon) {
        style.cartoon = { color: 'spectrum' };
    } else if (isTrace) {
        style.cartoon = { style: 'trace', color: 'spectrum' };
    } else if (isLine) {
        style.line = { color: 'spectrum' };
    } else if (isStick) {
        style.stick = { color: 'spectrum' };
    } else {
        style.sphere = { color: 'spectrum' };
    }

    // Update the color scheme for the selected style
    const currentStyle = getCurrentStyle();
    if (colorScheme === 'amino' && currentStyle) {
        style[currentStyle].color = 'none'; // Remove the existing color setting
        style[currentStyle].colorscheme = 'amino'; // Set the colorscheme
    } else if (colorScheme === 'ss-helix' && currentStyle === 'cartoon') {
        style.cartoon.color = 'none';
        viewer.setStyle({ ss: 'h' }, { cartoon: { color: 'spectrum' } });
    } else if (colorScheme === 'ss-sheet' && currentStyle === 'cartoon') {
        style.cartoon.color = 'none';
        viewer.setStyle({ ss: 's' }, { cartoon: { color: 'spectrum' } });
    }

    viewer.setStyle({}, style);
    viewer.zoomTo();
    viewer.render();
    viewer.zoom(1.2, 1000);
}


// Function to get the current style
function getCurrentStyle() {
    if (isCartoonStyle) {
        return 'cartoon';
    } else if (isTraceStyle) {
        return 'cartoon'; // Trace uses the cartoon style
    } else if (isLineStyle) {
        return 'line';
    } else if (isStickStyle) {
        return 'stick';
    } else if (isSphereStyle) {
        return 'sphere';
    }
    return null; // No style selected
}

function reset3DStructure() {
    load3DStructure(); // Call the function to reload the 3D structure
}

// Function to close the content window
function closeWindow() {
    // Store the current state of the window before hiding it
    originalContentDisplay = content.style.display;
    originalContentHeight = content.style.height;
    originalContentWidth = content.style.width;
    originalPdbContainerHeight = pdbContainer.style.height;

    content.style.display = "none"; // Hide the content when the icon is clicked

    // Disable the fa-minus-circle icon when the window is closed
    minusCircleIcon.classList.add('disabled');
}

showButton.addEventListener('click', () => {
    showContent();
    reset3DStructure(); // Reset the 3D structure when the window is reopened
});

document.querySelector('.fa.fa-times-circle').addEventListener('click', () => {
    closeWindow();
    reset3DStructure(); // Reset the 3D structure when the window is closed
});

// Add an event listener for each style link
document.getElementById('cartoon-link').addEventListener('click', function(event) {
    event.preventDefault();
    isCartoonStyle = true;
    isTraceStyle = false;
    isLineStyle = false;
    isStickStyle = false;
    isSphereStyle = false;
    updateSelectedStyle("Cartoon"); // Update the selected style text
    loadAndStylePDBData(true, false, false, false);
});

document.getElementById('sphere-link').addEventListener('click', function(event) {
    event.preventDefault();
    isCartoonStyle = false;
    isTraceStyle = false;
    isLineStyle = false;
    isStickStyle = false;
    isSphereStyle = true;
    updateSelectedStyle("Sphere"); // Update the selected style text
    loadAndStylePDBData(false, false, false, false);
});

document.getElementById('trace-link').addEventListener('click', function(event) {
    event.preventDefault();
    isCartoonStyle = false;
    isTraceStyle = true;
    isLineStyle = false;
    isStickStyle = false;
    isSphereStyle = false;
    updateSelectedStyle("Trace"); // Update the selected style text
    loadAndStylePDBData(false, true, false, false);
});

document.getElementById('line-link').addEventListener('click', function(event) {
    event.preventDefault();
    isCartoonStyle = false;
    isTraceStyle = false;
    isLineStyle = true;
    isStickStyle = false;
    isSphereStyle = false;
    updateSelectedStyle("Line"); // Update the selected style text
    loadAndStylePDBData(false, false, true, false);
});

document.getElementById('stick-link').addEventListener('click', function(event) {
    event.preventDefault();
    isCartoonStyle = false;
    isTraceStyle = false;
    isLineStyle = false;
    isStickStyle = true;
    isSphereStyle = false;
    updateSelectedStyle("Stick"); // Update the selected style text
    loadAndStylePDBData(false, false, false, true);
});

// Function to update the selected style text
function updateSelectedStyle(styleText) {
    document.getElementById('selected-style').textContent = styleText; // Update the selected style text
    document.getElementById('selected-color').textContent = 'Default'; // Return the selected color text back to default
}

// Add an event listener to handle changing to amino color scheme for cartoon representation
document.getElementById('aares').addEventListener('click', function(event) {
    event.preventDefault();
    
    // Determine the current style and apply the 'amino' colorScheme accordingly
    if (isCartoonStyle) {
        loadAndStylePDBData(true, false, false, false, 'amino');
    } else if (isTraceStyle) {
        loadAndStylePDBData(false, true, false, false, 'amino');
    } else if (isLineStyle) {
        loadAndStylePDBData(false, false, true, false, 'amino');
    } else if (isStickStyle) {
        loadAndStylePDBData(false, false, false, true, 'amino');
    } else if (isSphereStyle) {
        loadAndStylePDBData(false, false, false, false, 'amino');
    }
    
    // Update the selected color scheme text
    updateSelectedColorScheme("Amino Residue");
});

// Add an event listener to handle changing to ss-helix color scheme
document.getElementById('ss-helix').addEventListener('click', function(event) {
    event.preventDefault();

    if (activeColorScheme !== 'ss-helix') {
        viewer.setStyle({ss: 'h'}, {cartoon: {color: 'spectrum'}});
        viewer.zoomTo();
        viewer.render();
        viewer.zoom(1.2, 1000);
        activeColorScheme = 'ss-helix'; // Update the active color scheme
        updateSelectedColorScheme("Secondary structure (alpha helix)");
    }
});

// Add an event listener to handle changing to ss-sheet color scheme
document.getElementById('ss-sheet').addEventListener('click', function(event) {
    event.preventDefault();

    if (activeColorScheme !== 'ss-sheet') {
        viewer.setStyle({ss: 's'}, {cartoon: {color: 'spectrum'}});
        viewer.zoomTo();
        viewer.render();
        viewer.zoom(1.2, 1000);
        activeColorScheme = 'ss-sheet'; // Update the active color scheme
        updateSelectedColorScheme("Secondary structure (beta sheet)");
    }
});

function updateSelectedColorScheme(styleText) {
    document.getElementById('selected-color').textContent = styleText; //update selected color text
}