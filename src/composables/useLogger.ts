export function useLogger() {
  const logSignature = () => {
    console.log(
      `%c 
                    _
                  _(_)_                  
      @@@@       (_)@(_)   vVVVv     _   
     @@()@@ wWWWw  (_)\\    (___)   _(_)_ 
      @@@@  (___)     -|/    Y    (_)@(_)
       /      Y       \\|    \\|/    /(_)  
    \\ |     \\ |/       | / \\ | /  \\|/    
    \\\\|//   \\\\|///   \\\\\|//  \\\|/// \\|///  
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
App dev by Kristin Vaughn
`,
      'font-family:monospace',
    );
  };

  return { logSignature };
}
