/**
 * Wire contract of the host-side WeDrive picker, shared verbatim by the Host
 * routes and the browser half.
 *
 * Every read goes through the already authorized `wecom-cli`, so the browser
 * never needs a WeCom web session: no iframe, no third-party cookies, no
 * top-level navigation, and no external-browser login hop.
 *
 * Browser references are document-relative (`*_ROUTE`); server route keys stay
 * absolute pathnames (`*_PATH`), per the web app-owned route convention.
 */

/** GET: authorization state, CLI version, and any in-flight login attempt. */
export const PICKER_STATUS_PATH = '/wecom-picker/status'

/** Browser-relative form of {@link PICKER_STATUS_PATH}. */
export const PICKER_STATUS_ROUTE = PICKER_STATUS_PATH.slice(1)

/** GET: recently browsed files, or keyword search results when `q` is present. */
export const PICKER_FILES_PATH = '/wecom-picker/files'

/** Browser-relative form of {@link PICKER_FILES_PATH}. */
export const PICKER_FILES_ROUTE = PICKER_FILES_PATH.slice(1)

/**
 * POST: start one `wecom-cli auth init` QR login, waiting for a scan.
 * `?restart=1` retires a running attempt and starts a fresh login — a QR code
 * cannot be refreshed in place, so an expired code is only recoverable that
 * way.
 */
export const PICKER_AUTH_START_PATH = '/wecom-picker/auth/start'

/** Browser-relative form of {@link PICKER_AUTH_START_PATH}. */
export const PICKER_AUTH_START_ROUTE = PICKER_AUTH_START_PATH.slice(1)

/** GET: the QR image written by the running login attempt. */
export const PICKER_AUTH_QR_PATH = '/wecom-picker/auth/qr.png'

/** Browser-relative form of {@link PICKER_AUTH_QR_PATH}. */
export const PICKER_AUTH_QR_ROUTE = PICKER_AUTH_QR_PATH.slice(1)

/** GET: how the composer exposes the picker. */
export const PICKER_CONFIG_PATH = '/wecom-picker/config'

/** Browser-relative form of {@link PICKER_CONFIG_PATH}. */
export const PICKER_CONFIG_ROUTE = PICKER_CONFIG_PATH.slice(1)

/** Where the picker appears in the composer. */
                                                                

/** GET {@link PICKER_CONFIG_PATH} response. */
                                      
                                     
 

/** Chip payload cap, matching the official selector's `selectFileMaxlength`. */
export const PICKER_MAX_SELECTION = 10

/** Chip identity source, mirroring the official selector's `doc_id` / entry id split. */
                                         

/** One pickable WeDrive entry. */
                             
                                                                                                         
                     
                                                        
                               
                      
                       
                                                                    
                                  
                                                                                 
                        
                                                            
                       
                                                                      
                        
                                       
                             
                                                                       
                        
                                                                
                           
                               
                             
                                                                  
                            
                                
                              
 

/** Progress of the in-app `wecom-cli auth init` attempt. */
                                                                        

/** Login-attempt observation surfaced beside the QR image. */
                                  
                                 
                                                                      
                        
                                                             
                           
 

/** Why the picker cannot list right now. */
                                                                  

/** GET {@link PICKER_STATUS_PATH} response. */
                                      
                                                                                                      
                                                
                                                                
                           
                                                      
                           
                                                             
                                
 

/** GET {@link PICKER_FILES_PATH} success response. */
                                     
                   
                                       
                                                                     
                           
                              
 

/** GET {@link PICKER_FILES_PATH} refusal. */
                                       
                    
                                 
                          
 

/** GET {@link PICKER_FILES_PATH} response. */
                                                                           


//# sourceURL=/Users/cillivian/Documents/workspace/wecom-file-dsh/src/shared/protocol.ts