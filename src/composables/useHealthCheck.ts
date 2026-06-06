import { healthApi } from '@/api/health';

export function useHealthCheck() {
  const init = async () => {
    const healthCheck = await healthApi.getHealth();

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
`,
      'font-family:monospace',
    );
    console.log(healthCheck);
  };

  return { init };
}
